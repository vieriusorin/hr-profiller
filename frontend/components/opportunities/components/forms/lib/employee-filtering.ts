import { Employee } from '@/lib/api-client';
import { Opportunity } from '@/lib/api-client';

const KEYWORDS = {
  frontend: ['frontend', 'fe', 'ui', 'ux', 'react', 'angular', 'vue', 'javascript'],
  backend: ['backend', 'be', 'node', 'java', 'python', 'php', 'database', 'api'],
  qa: ['qa', 'test', 'quality', 'automation'],
  devops: ['devops', 'aws', 'azure', 'gcp', 'docker', 'kubernetes'],
};

const getRoleDiscipline = (roleName: string): keyof typeof KEYWORDS | null => {
  const lowerRoleName = roleName.toLowerCase();
  for (const discipline in KEYWORDS) {
    if (KEYWORDS[discipline as keyof typeof KEYWORDS].some(keyword => lowerRoleName.includes(keyword))) {
      return discipline as keyof typeof KEYWORDS;
    }
  }
  return null;
};

const isAvailable = (employee: Employee, opportunity: Opportunity): boolean => {
  // @ts-expect-error - need to have this field in BE and sync with FE
  if (!employee.unavailableDates || employee.unavailableDates.length === 0) {
    return true;
  }

  if (!opportunity.expectedEndDate) {
    return true; // Cannot check availability without an end date
  }

  const opportunityStartDate = new Date(opportunity.expectedStartDate || "");
  const opportunityEndDate = new Date(opportunity.expectedEndDate || "");
  // @ts-expect-error - need to have this field in BE and sync with FE
  for (const unavailability of employee.unavailableDates) {
    const unavailableStartDate = new Date(unavailability.startDate);
    const unavailableEndDate = new Date(unavailability.endDate);

    if (
      (opportunityStartDate >= unavailableStartDate && opportunityStartDate <= unavailableEndDate) ||
      (opportunityEndDate >= unavailableStartDate && opportunityEndDate <= unavailableEndDate) ||
      (unavailableStartDate >= opportunityStartDate && unavailableStartDate <= opportunityEndDate)
    ) {
      return false;
    }
  }

  return true;
}

export const getAvailableEmployees = (
  employees: Employee[],
  roleName: string | undefined,
  opportunity?: Opportunity
): Employee[] => {
  let availableEmployees = employees.filter(emp => emp.employeeStatus === 'Active');

  if (opportunity) {
    availableEmployees = availableEmployees.filter(emp => isAvailable(emp, opportunity));
  }

  if (!roleName) {
    return availableEmployees;
  }

  const discipline = getRoleDiscipline(roleName);

  if (discipline) {
    const disciplineKeywords = KEYWORDS[discipline];
    return availableEmployees.filter(emp =>
      disciplineKeywords.some(keyword => emp.position?.toLowerCase().includes(keyword) || false)
    );
  }

  return availableEmployees;
}; 