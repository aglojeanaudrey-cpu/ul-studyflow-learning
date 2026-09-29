from django.contrib import admin
from .models import Department, Program, AcademicYear

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'faculty', 'is_suspended')
    list_filter = ('is_suspended', 'faculty')
    search_fields = ('code', 'name', 'faculty')


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'department', 'is_suspended')
    list_filter = ('is_suspended', 'department')
    search_fields = ('code', 'name', 'department__code')


@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    list_display = ('label', 'is_current', 'is_archived')
    list_filter = ('is_current', 'is_archived')
    search_fields = ('label',)
