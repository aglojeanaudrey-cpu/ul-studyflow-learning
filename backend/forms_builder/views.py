import csv
from io import StringIO
from django.http import HttpResponse
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import DynamicForm, FormSubmission
from .serializers import DynamicFormSerializer, FormSubmissionSerializer
from accounts.permissions import IsStaffOrSuperuser

class FormListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        forms = DynamicForm.objects.filter(is_active=True).order_by('-created_at')
        return Response({'forms': DynamicFormSerializer(forms, many=True).data})


class FormDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, form_id):
        try:
            form = DynamicForm.objects.get(id=form_id, is_active=True)
        except DynamicForm.DoesNotExist:
            return Response({'error': 'Formulaire introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'form': DynamicFormSerializer(form).data})


class FormSubmitView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, form_id):
        try:
            form = DynamicForm.objects.get(id=form_id)
        except DynamicForm.DoesNotExist:
            return Response({'error': 'Ce formulaire n\'est plus disponible.'}, status=status.HTTP_404_NOT_FOUND)

        if not form.is_active:
            return Response({'error': 'Ce formulaire n\'est plus disponible.'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user if request.user and request.user.is_authenticated else None
        data = request.data.get('data', {})
        guest_name = request.data.get('guestName')
        guest_phone = request.data.get('guestPhone')

        user_name = f"{user.first_name} {user.last_name}" if user else (guest_name or 'Visiteur')
        user_phone = user.display_phone or user.phone if user else (guest_phone or 'Non renseigné')

        submission = FormSubmission.objects.create(
            form=form,
            user=user,
            user_name=user_name,
            user_phone=user_phone,
            data=data,
            submitted_at=timezone.now()
        )

        try:
            from audit.utils import log_audit
            log_audit(
                action='FORM_SUBMIT',
                resource=form.id,
                details=f'Soumission formulaire "{form.title}" par {user_name}',
                user=user,
                ip=request.META.get('REMOTE_ADDR')
            )
        except Exception:
            pass

        return Response({'success': True, 'submissionId': submission.id})


class AdminFormCreateView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def post(self, request):
        title = request.data.get('title', '').strip()
        if not title:
            return Response({'error': 'Titre du formulaire requis.'}, status=status.HTTP_400_BAD_REQUEST)

        form = DynamicForm.objects.create(
            title=title,
            description=request.data.get('description', ''),
            theme_color=request.data.get('themeColor', '#075E54'),
            fields=request.data.get('fields', []),
            is_active=True
        )

        return Response({'success': True, 'form': DynamicFormSerializer(form).data})


class AdminFormUpdateView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def put(self, request, form_id):
        try:
            form = DynamicForm.objects.get(id=form_id)
        except DynamicForm.DoesNotExist:
            return Response({'error': 'Formulaire introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        if 'title' in data: form.title = data['title']
        if 'description' in data: form.description = data['description']
        if 'themeColor' in data: form.theme_color = data['themeColor']
        if 'fields' in data: form.fields = data['fields']
        if 'isActive' in data: form.is_active = bool(data['isActive'])
        form.save()

        return Response({'success': True, 'form': DynamicFormSerializer(form).data})

    def delete(self, request, form_id):
        try:
            form = DynamicForm.objects.get(id=form_id)
        except DynamicForm.DoesNotExist:
            return Response({'error': 'Formulaire introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        form.delete()
        return Response({'success': True})


class AdminFormDeleteView(AdminFormUpdateView):
    pass


class AdminFormSubmissionsView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def get(self, request, form_id):
        submissions = FormSubmission.objects.filter(form_id=form_id).order_by('-submitted_at')
        return Response({'submissions': FormSubmissionSerializer(submissions, many=True).data})


class AdminFormExportCsvView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def get(self, request, form_id):
        try:
            form = DynamicForm.objects.get(id=form_id)
        except DynamicForm.DoesNotExist:
            return Response({'error': 'Formulaire introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        submissions = FormSubmission.objects.filter(form_id=form_id).order_by('-submitted_at')

        fields_list = form.fields or []
        field_keys = [f.get('id') for f in fields_list]
        field_labels = [f.get('label', f.get('id')) for f in fields_list]

        headers = ['Date', 'Nom Étudiant', 'Téléphone'] + field_labels

        output = StringIO()
        # UTF-8 BOM pour une ouverture directe et sans problème dans Microsoft Excel
        output.write('\ufeff')
        writer = csv.writer(output, delimiter=';', quoting=csv.QUOTE_MINIMAL)
        writer.writerow(headers)

        for sub in submissions:
            row = [
                sub.submitted_at.strftime('%d/%m/%Y %H:%M'),
                sub.user_name,
                sub.user_phone
            ]
            for key in field_keys:
                val = sub.data.get(key, '') if isinstance(sub.data, dict) else ''
                if isinstance(val, list):
                    val = ', '.join(str(v) for v in val)
                row.append(str(val))
            writer.writerow(row)

        response = HttpResponse(output.getvalue(), content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = f'attachment; filename="soumissions_{form.id}_{int(timezone.now().timestamp())}.csv"'
        return response
