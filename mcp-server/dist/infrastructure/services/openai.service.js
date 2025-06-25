"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIServiceImpl = void 0;
const inversify_1 = require("inversify");
const openai_1 = __importDefault(require("openai"));
let OpenAIServiceImpl = class OpenAIServiceImpl {
    constructor() {
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    async generateCompletion(prompt, options) {
        try {
            const completion = await this.openai.chat.completions.create({
                model: options?.model || 'gpt-4o',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: options?.temperature || 0.7,
                max_tokens: options?.maxTokens || 4000,
            });
            const content = completion.choices[0]?.message?.content || '';
            const tokensUsed = completion.usage?.total_tokens || 0;
            const model = completion.model;
            return {
                content,
                tokensUsed,
                model
            };
        }
        catch (error) {
            console.error('OpenAI API error:', error);
            throw new Error(`OpenAI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
};
exports.OpenAIServiceImpl = OpenAIServiceImpl;
exports.OpenAIServiceImpl = OpenAIServiceImpl = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], OpenAIServiceImpl);
