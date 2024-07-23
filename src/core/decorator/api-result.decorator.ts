import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { ResponseDto } from 'src/types/response.dto';
import { PageVo } from 'src/user/vo/page.vo';

const baseTypeNames = ['String', 'Number', 'Boolean'];
/**
 * ApiResult 装饰器
 * @param model 数据模型
 * @param isArray 是否为数组
 * @param isPager 是否为分页数据
 */
const ApiCommonResult = <TModel extends Type<any>>(
  model?: TModel,
  isArray?: boolean,
  isPager?: boolean,
  description?: string,
) => {
  let items = null;
  const modelBaseType = model && baseTypeNames.includes(model.name);
  if (modelBaseType) {
    items = {
      type: model.name.toLowerCase(),
    };
  } else {
    items = {
      $ref: getSchemaPath(model),
    };
  }
  let prop = null;
  if (isArray && !isPager) {
    prop = {
      type: 'array',
      items,
    };
  } else if (isPager) {
    prop = {
      allOf: [
        {
          $ref: getSchemaPath(PageVo),
        },
        {
          properties: {
            list: {
              type: 'array',
              items,
            },
          },
          type: 'object',
          items: { $ref: getSchemaPath(PageVo) },
        },
      ],
    };
  } else if (model) {
    prop = items;
  } else {
    prop = {
      type: 'string',
      default: 'success',
    };
  }

  const extraModel = model
    ? [model, ResponseDto, PageVo]
    : [ResponseDto, PageVo];
  return applyDecorators(
    ApiExtraModels(...extraModel),
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseDto), type: 'object' },
          {
            properties: {
              data: prop,
            },
          },
        ],
      },
    }),
  );
};

export const ApiResult = <TModel extends Type<any>>(
  model?: TModel,
  description?: string,
) => ApiCommonResult<TModel>(model, false, false, description);

export const ApiArrayResult = <TModel extends Type<any>>(
  model: TModel,
  description?: string,
) => ApiCommonResult<TModel>(model, true, false, description);

export const ApiPagerResult = <TModel extends Type<any>>(
  model: TModel,
  description?: string,
) => ApiCommonResult<TModel>(model, false, true, description);
