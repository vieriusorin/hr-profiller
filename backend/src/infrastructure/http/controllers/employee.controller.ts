import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { TYPES } from '../../../shared/types';
import { EmployeeService } from '../../../domain/employee/services/employee.service';
import { EmployeePresenter } from '../../../interfaces/presenters/employee.presenter';
import { QueryParser } from '../../../shared/utils/query-parser';
import { CreateEmployeeSchema, UpdateEmployeeSchema, TypeNewEmployee, TypeUpdateEmployee } from '../../../../db/schema/employee.schema';

@injectable()
export class EmployeeController {
  private readonly presenter = new EmployeePresenter();

  constructor(
    @inject(TYPES.EmployeeService)
    private readonly employeeService: EmployeeService
  ) {}

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      
      const employees = await this.employeeService.getAllEmployees();
      console.log(`Found ${employees.length} employees`);

      // Parse query parameters
      const queryParams = QueryParser.parseAll(req);

      // Process the collection using the presenter's internal methods
      const { processedData, totalFiltered, totalOriginal } = (this.presenter as any).processCollection(employees, queryParams);
      const presentedData = this.presenter.presentCollection(processedData);

      // Create pagination metadata
      const { page = 1, limit = 10 } = queryParams;
      const totalPages = Math.ceil(totalFiltered / limit);
      const pagination = {
        page,
        limit,
        total: totalFiltered,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        previousPage: page > 1 ? page - 1 : null,
      };

      // Create the response with flatter structure
      const response = {
        status: 'success' as const,
        data: presentedData,
        pagination,
        filters: queryParams.filters,
        search: queryParams.search ? { search: queryParams.search, searchFields: queryParams.searchFields } : undefined,
        sort: queryParams.sortBy ? { sortBy: queryParams.sortBy, sortOrder: queryParams.sortOrder } : undefined,
        meta: {
          count: presentedData.length,
          filtered: totalFiltered,
          total: totalOriginal,
          timestamp: new Date().toISOString(),
          endpoint: req.originalUrl,
        }
      };

      res.status(200).json(response);
    } catch (error: any) {
      console.error('Error in EmployeeController.getAll:', error);
      console.error('Stack trace:', error.stack);
      const errorResponse = this.presenter.error(error);
      res.status(500).json(errorResponse);
    }
  }

  async getById(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const employee = await this.employeeService.getEmployeeById(id);

      if (!employee) {
        const errorResponse = this.presenter.error({ message: 'Employee not found', code: 'NOT_FOUND' });
        res.status(404).json(errorResponse);
        return;
      }

      const response = this.presenter.success(employee);
      res.status(200).json(response);
    } catch (error: any) {
      console.error('Error fetching employee:', error);
      const errorResponse = this.presenter.error(error);
      res.status(500).json(errorResponse);
    }
  }

  async create(req: Request<{}, {}, TypeNewEmployee>, res: Response): Promise<void> {
    try {
      const employeeValidation = CreateEmployeeSchema.safeParse(req.body);
      
      if (!employeeValidation.success) {
        const errorResponse = this.presenter.error({ 
          message: 'Invalid request body', 
          code: 'VALIDATION_ERROR',
          details: employeeValidation.error.format()
        });
        res.status(400).json(errorResponse);
        return;
      }
      
      const employeeData = employeeValidation.data;

      const employee = await this.employeeService.createEmployee(employeeData);
      const response = this.presenter.success(employee);
      res.status(201).json(response);
    } catch (error: any) {
      console.error('Error creating employee:', error);
      const errorResponse = this.presenter.error(error);
      res.status(500).json(errorResponse);
    }
  }

  async update(req: Request<{ id: string }, {}, TypeUpdateEmployee>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const employeeValidation = UpdateEmployeeSchema.safeParse(req.body);

      if (!employeeValidation.success) {
        const errorResponse = this.presenter.error({ 
          message: 'Invalid request body', 
          code: 'VALIDATION_ERROR',
          details: employeeValidation.error.format()
        });
        res.status(400).json(errorResponse);
        return;
      }

      const employee = await this.employeeService.updateEmployee(id, employeeValidation.data);
      const response = this.presenter.success(employee);
      res.status(200).json(response);
    } catch (error: any) {
      console.error('Error updating employee:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      const errorResponse = this.presenter.error(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  async delete(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.employeeService.deleteEmployee(id);

      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      const errorResponse = this.presenter.error(error);
      res.status(statusCode).json(errorResponse);
    }
  }
} 