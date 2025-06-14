import { Employee } from '@/shared/types/employees';

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

export const getAvailableEmployees = (employees: Employee[], roleName: string | undefined): Employee[] => {
  const activeEmployees = employees.filter(emp => emp.employeeStatus === 'Active');

  if (!roleName) {
    return activeEmployees;
  }

  const discipline = getRoleDiscipline(roleName);

  if (discipline) {
    const disciplineKeywords = KEYWORDS[discipline];
    return activeEmployees.filter(emp =>
      disciplineKeywords.some(keyword => emp.position.toLowerCase().includes(keyword))
    );
  }

  return activeEmployees;
}; 