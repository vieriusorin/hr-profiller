import { Router } from 'express';
import { container } from '../../container';
import { TYPES } from '../../../shared/types';
import { McpController } from '../controllers/mcp.controller';

const router = Router();
const mcpController = container.get<McpController>(TYPES.McpController);

// MCP Tools endpoints
router.get('/tools', (req, res) => mcpController.getTools(req, res));

// // // MCP Analysis endpoints
// router.post('/analyze', (req, res) => mcpController.analyzeData(req, res));

// // // MCP Report endpoints
// router.post('/report', (req, res) => mcpController.generateReport(req, res));

// MCP Tool execution endpoint
//@ts-ignore
router.post('/execute', (req, res) => mcpController.executeTool(req, res));

// MCP Health check endpoint
router.get('/health', (req, res) => mcpController.checkHealth(req, res));

export default router; 