import { TErrorSources, TGenericErrorResponse } from "../interface/error";

const handleDuplicateError = (err: any): TGenericErrorResponse => {
  const match = err.message.match(/"([^"]*)"/);
  const extractedMessage = match && match[1];
  const errorSources: TErrorSources = [{ path: "", message: `${extractedMessage} already exists` }];
  return { statusCode: 400, message: "Duplicate Entry", errorSources };
};

export default handleDuplicateError;
