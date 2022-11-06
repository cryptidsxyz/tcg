import { Configuration, OpenAIApi } from 'openai';
const configuration = new Configuration({
	apiKey: import.meta.env.VITE_ENV_OPENAI_KEY
});
export const openai = new OpenAIApi(configuration);
export default openai;
