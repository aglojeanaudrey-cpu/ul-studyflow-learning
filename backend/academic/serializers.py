from rest_framework import serializers
from .models import Department, Program, AcademicYear

class DepartmentSerializer(serializers.ModelSerializer):
    isSuspended = serializers.BooleanField(source='is_suspended', required=False)

    class Meta:
        model = Department
        fields = ['id', 'code', 'name', 'faculty', 'description', 'isSuspended']


class ProgramSerializer(serializers.ModelSerializer):
    departmentId = serializers.CharField(source='department_id')
    isSuspended = serializers.BooleanField(source='is_suspended', required=False)

    class Meta:
        model = Program
        fields = ['id', 'departmentId', 'code', 'name', 'description', 'isSuspended']


class AcademicYearSerializer(serializers.ModelSerializer):
    isCurrent = serializers.BooleanField(source='is_current', required=False)
    isArchived = serializers.BooleanField(source='is_archived', required=False)

    class Meta:
        model = AcademicYear
        fields = ['id', 'label', 'isCurrent', 'isArchived']
