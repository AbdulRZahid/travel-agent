import {
  applyDecorators,
  SerializeOptions,
  Type,
  UseInterceptors,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ClassSerializerInterceptor } from '@nestjs/common';

export const ApiSuccessResponse = <T>(type: Type<T> | [Type<T>]) => {
  const modelType = Array.isArray(type) ? type[0] : type;
  const isArray = Array.isArray(type);

  return applyDecorators(
    ApiResponse({ type: modelType, isArray }),
    SerializeOptions({ type: modelType }),
    UseInterceptors(ClassSerializerInterceptor),
  );
};
