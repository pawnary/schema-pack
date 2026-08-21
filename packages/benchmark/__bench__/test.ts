import dataTypesFactory from '../src/dataTypesFactory.ts';
import SerializerBenchSuite from '../src/serializerBenchSuite.ts';

const suite = new SerializerBenchSuite(dataTypesFactory);

suite.withDataType('bin16').run();
