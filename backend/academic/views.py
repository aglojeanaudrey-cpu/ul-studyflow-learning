from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Department, Program, AcademicYear
from .serializers import DepartmentSerializer, ProgramSerializer, AcademicYearSerializer
from accounts.permissions import IsStaffOrSuperuser
from monetization.models import PlatformConfig
from monetization.serializers import PlatformConfigSerializer

class AcademicMetaView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        departments = Department.objects.all().order_by('code')
        programs = Program.objects.all().order_by('code')
        academic_years = AcademicYear.objects.all().order_by('-label')
        config = PlatformConfig.get_solo()

        return Response({
            'departments': DepartmentSerializer(departments, many=True).data,
            'programs': ProgramSerializer(programs, many=True).data,
            'academicYears': AcademicYearSerializer(academic_years, many=True).data,
            'levels': ['L1', 'L2', 'L3'],
            'config': PlatformConfigSerializer(config).data
        })


class AdminDepartmentView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def post(self, request):
        data = request.data
        dept_id = data.get('id')
        code = data.get('code', '').strip().upper()
        name = data.get('name', '').strip()

        if not code or not name:
            return Response({'error': 'Code et nom requis.'}, status=status.HTTP_400_BAD_REQUEST)

        if dept_id:
            try:
                dept = Department.objects.get(id=dept_id)
            except Department.DoesNotExist:
                return Response({'error': 'Département introuvable.'}, status=status.HTTP_404_NOT_FOUND)
            dept.code = code
            dept.name = name
            if 'faculty' in data:
                dept.faculty = data['faculty']
            if 'description' in data:
                dept.description = data['description']
            if 'isSuspended' in data:
                dept.is_suspended = bool(data['isSuspended'])
            dept.save()
        else:
            dept = Department.objects.create(
                code=code,
                name=name,
                faculty=data.get('faculty', 'Université de Lomé'),
                description=data.get('description', ''),
                is_suspended=bool(data.get('isSuspended', False))
            )

        return Response({'success': True, 'department': DepartmentSerializer(dept).data})


class AdminDepartmentSuspendView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def put(self, request, dept_id):
        try:
            dept = Department.objects.get(id=dept_id)
        except Department.DoesNotExist:
            return Response({'error': 'Département introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        dept.is_suspended = not dept.is_suspended
        dept.save()
        return Response({'success': True, 'isSuspended': dept.is_suspended})


class AdminDepartmentDeleteView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def delete(self, request, dept_id):
        try:
            dept = Department.objects.get(id=dept_id)
        except Department.DoesNotExist:
            return Response({'error': 'Département introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        dept.delete()
        return Response({'success': True})


class AdminProgramView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def post(self, request):
        data = request.data
        prog_id = data.get('id')
        dept_id = data.get('departmentId')
        code = data.get('code', '').strip().upper()
        name = data.get('name', '').strip()

        if not code or not name or not dept_id:
            return Response({'error': 'Département, code et nom requis.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            department = Department.objects.get(id=dept_id)
        except Department.DoesNotExist:
            return Response({'error': 'Département spécifié introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        if prog_id:
            try:
                prog = Program.objects.get(id=prog_id)
            except Program.DoesNotExist:
                return Response({'error': 'Filière introuvable.'}, status=status.HTTP_404_NOT_FOUND)
            prog.department = department
            prog.code = code
            prog.name = name
            if 'description' in data:
                prog.description = data['description']
            if 'isSuspended' in data:
                prog.is_suspended = bool(data['isSuspended'])
            prog.save()
        else:
            prog = Program.objects.create(
                department=department,
                code=code,
                name=name,
                description=data.get('description', ''),
                is_suspended=bool(data.get('isSuspended', False))
            )

        return Response({'success': True, 'program': ProgramSerializer(prog).data})


class AdminProgramSuspendView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def put(self, request, prog_id):
        try:
            prog = Program.objects.get(id=prog_id)
        except Program.DoesNotExist:
            return Response({'error': 'Filière introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        prog.is_suspended = not prog.is_suspended
        prog.save()
        return Response({'success': True, 'isSuspended': prog.is_suspended})


class AdminProgramDeleteView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def delete(self, request, prog_id):
        try:
            prog = Program.objects.get(id=prog_id)
        except Program.DoesNotExist:
            return Response({'error': 'Filière introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        prog.delete()
        return Response({'success': True})


class AdminAcademicYearView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def post(self, request):
        label = request.data.get('label', '').strip()
        is_current = bool(request.data.get('isCurrent', False))

        if not label:
            return Response({'error': 'Libellé d\'année requis (ex: 2026-2027).'}, status=status.HTTP_400_BAD_REQUEST)

        ay = AcademicYear.objects.create(
            label=label,
            is_current=is_current,
            is_archived=False
        )

        if is_current:
            config = PlatformConfig.get_solo()
            config.academic_year_current = label
            config.save()

        return Response({'success': True, 'academicYear': AcademicYearSerializer(ay).data})

    def put(self, request, ay_id):
        try:
            ay = AcademicYear.objects.get(id=ay_id)
        except AcademicYear.DoesNotExist:
            return Response({'error': 'Année académique introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        if 'label' in data:
            ay.label = data['label'].strip()

        if 'isCurrent' in data:
            is_cur = bool(data['isCurrent'])
            ay.is_current = is_cur
            if is_cur:
                ay.is_archived = False
                config = PlatformConfig.get_solo()
                config.academic_year_current = ay.label
                config.save()

        if 'isArchived' in data:
            is_arc = bool(data['isArchived'])
            ay.is_archived = is_arc
            if is_arc:
                ay.is_current = False

        ay.save()
        return Response({'success': True, 'academicYear': AcademicYearSerializer(ay).data})

    def delete(self, request, ay_id):
        try:
            ay = AcademicYear.objects.get(id=ay_id)
        except AcademicYear.DoesNotExist:
            return Response({'error': 'Année académique introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        if ay.is_current:
            return Response({'error': 'Impossible de supprimer l\'année en cours active.'}, status=status.HTTP_400_BAD_REQUEST)

        ay.delete()
        return Response({'success': True})
