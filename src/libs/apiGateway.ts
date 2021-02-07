import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda"
import type { FromSchema } from "json-schema-to-ts";

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & { body: FromSchema<S> }
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResult>

export const formatSuccessJSONResponse = (response: Record<string, unknown> | string) => {
  return {
    statusCode: 200,
    body: response
  }
}

export const formatErrorJSONResponse = (response: Record<string, unknown> | string) => {
  return {
    statusCode: 400,
    body: response
  }
}

export const formatInternalErrorJSONResponse = (response: Record<string, unknown> | string) => {
  return {
    statusCode: 500,
    body: response
  }
}
