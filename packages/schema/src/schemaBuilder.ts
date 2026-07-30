import isObject from "./utils/isObject.ts";
import SchemaNode from "./schemaNode.ts";
import type { Schema } from "./types.ts";
import Variant from "./variant.ts";
import type { IdAlgorithm } from "./hash/types.ts";
import Fmix32 from "./hash/algorithms/fmix32.ts";
import { inspect } from "node:util";

export type SchemaBuilderOptions = {
  data: unknown;
  idAlgorithm?: IdAlgorithm;
};

class SchemaBuilder {
  #data: unknown;
  #idAlgorithm: IdAlgorithm;
  #schema: Schema | undefined;
  #schemaNodes: Record<string, SchemaNode> = {};
  #variants?: Record<string, Variant>;

  public constructor(options: SchemaBuilderOptions) {
    this.#data = options.data;
    this.#idAlgorithm = options.idAlgorithm || Fmix32;
  }

  protected addNode(name: string, keys: string[]): SchemaNode {
    if (keys.length === 0) {
      throw new Error(`Cannot add node with name "${name}" and empty keys`);
    }

    this.#variants = undefined;

    let schemaNode: SchemaNode;

    if (name in this.#schemaNodes) {
      schemaNode = this.#schemaNodes[name];
    } else {
      schemaNode = new SchemaNode(name);
      this.#schemaNodes[name] = schemaNode;
    }

    schemaNode.addVariant(keys);

    return schemaNode;
  }

  protected buildTokenNodes(
    value: unknown,
    parentKey: string
  ): void {
    if (Array.isArray(value)) {
      for (const item of value) {
        this.buildTokenNodes(item, parentKey);
      }
    } else if (isObject(value)) {
      const keys = Object.keys(value);

      this.addNode(parentKey, keys);

      for (const key of keys) {
        const childValue = value[key as keyof typeof value];

        if (Array.isArray(childValue)) {
          this.buildTokenNodes(childValue, key);
        } else if (isObject(childValue)) {
          this.buildTokenNodes(childValue, key);
        }
      }
    }
  }

  protected getVariants(): Record<string, Variant> {
    if (!this.#variants) {
      this.buildTokenNodes(this.#data, 'root');

      const variants: Record<string, Variant> = {};

      const nodes = this.#schemaNodes;

      const nodesKeys = Object.keys(nodes);

      for (let i = 0; i < nodesKeys.length; i++) {
        const leftNode = nodes[nodesKeys[i]];

        for (let j = i + 1; j < nodesKeys.length; j++) {
          const rightNode = nodes[nodesKeys[j]];

          const leftNodeVariants = leftNode.getVariants();
          const rightNodeVariants = rightNode.getVariants();

          for (const leftNodeVariantId in leftNodeVariants) {
            const leftNodeVariant = leftNodeVariants[leftNodeVariantId];

            for (const rightNodeVariantId in rightNodeVariants) {
              const rightNodeVariant = rightNodeVariants[rightNodeVariantId];

              const variantsIntersections = leftNodeVariant.keys.intersection(rightNodeVariant.keys);

              if (variantsIntersections.size === 0) {
                if (!(leftNodeVariant.id in variants)) {
                  variants[leftNodeVariant.id] = leftNodeVariant;
                }

                if (!(rightNodeVariant.id in variants)) {
                  variants[rightNodeVariant.id] = rightNodeVariant;
                }

                continue;
              }

              const commonVariant = new Variant(variantsIntersections);

              leftNodeVariant.addCommonVariant(commonVariant);
              rightNodeVariant.addCommonVariant(commonVariant);

              if (commonVariant.id in variants) {
                // TODO: add more descriptive error message
                throw new Error(`Variant with id "${commonVariant.id}" already exists in variants`);
              }

              variants[commonVariant.id] = commonVariant;
            }
          }
        }
      }

      this.#variants = variants;
    }

    return this.#variants;
  }

  public getSchema(): Schema {
    if (!this.#schema) {
      const variants = this.getVariants();

      const tokenizedSchema = new Map<number, (string|number)[]>();
      const schema: Schema = [];
      const schemaTokenPositions = new Map<number, number>(); // token -> schema position
      const missingSchemaTokens = new Set<number>();

      for (const variantId in variants) {
        const variant = variants[variantId];

        const template: (string|number)[] = [];

        for (const key of variant.keys) {
          template.push(key);
        }

        if (variant.commonVariants.length > 0) {
          for (const commonVariant of variant.commonVariants) {
            template.push(commonVariant.token);
          }

          missingSchemaTokens.add(variant.token);
        } else {
          schemaTokenPositions.set(variant.token, schema.length);
          schema.push(template);
        }

        tokenizedSchema.set(variant.token, template);
      }

      while (missingSchemaTokens.size > 0) {
        ROOT: for (const token of missingSchemaTokens) {
          const template = tokenizedSchema.get(token)!;
          const positionedTemplate: (string|number)[] = [];

          for (const key of template) {
            if (typeof key === 'string') {
              positionedTemplate.push(key);
              continue;
            }

            const positionToken = schemaTokenPositions.get(key);

            if (typeof positionToken === 'undefined') {
              continue ROOT;
            }

            positionedTemplate.push(positionToken);
          }

          missingSchemaTokens.delete(token);

          schemaTokenPositions.set(token, schema.length);
          schema.push(positionedTemplate);
        }
      }

      this.#schema = schema;
    }
    return this.#schema;
  }
}

export default SchemaBuilder;
