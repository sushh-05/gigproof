import { checkEligibility } from './logic/rules-engine.js';

export const lambdaHandler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const result = checkEligibility(body.records);
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: err.message })
    };
  }
};