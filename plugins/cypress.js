/// <reference types="cypress" />

const createActionsFromDB = require('../lib/actions/reducer');
const database = require('../lib/db');

class FacticePlugin {
  /** @type {any} */
  actions = {};

  /**
   * @param {{data: any, host?:string}} config
   */
  constructor({ data }) {
    const db = database(data);
    this.actions = createActionsFromDB(db);
  }

  /**
   * Return response from factice data
   * @param {{resource: string, id?: string, query?: any, params?: any, protocol?:string}} config
   */

  response({
    resource: resourceName,
    id = undefined,
    query = {},
    params = {},
    protocol = undefined,
  }) {
    /** @type {{ model: LodashWrapper, methods: any }} */
    const action = this.actions[resourceName];

    const mockReq = {
      query,
      params,
      protocol,
    };

    if (resourceName.match(':id')) {
      if (id) {
        mockReq.params.id = id;
      } else {
        throw Error(
          'If you have an :id in your url you should specify an id parameter'
        );
      }
    }

    const result = action.methods.get(mockReq, {
      parentResourceName: null,
      parentId: null,
    });

    const headers = result.headers
      ? result.headers.reduce((acc, { name, value }) => {
          return { ...acc, [name]: value };
        }, {})
      : {};
    return { response: result.value, headers };
  }
}

/** @type FacticePlugin */
let instance;

module.exports = {
  /**
   * init factice instance singleton
   * @param {{data: any, host?:string}} config
   */
  init({ data }) {
    if (!instance) instance = new FacticePlugin({ data });
  },

  /**
   * Return response from factice data
   * @param {{resource: string, id?: string, query?: any, params?: any, protocol?:string}} config
   */
  response(config) {
    if (!instance) throw Error('Factice need to be initialized with factice.init()');
    else return instance.response(config);
  },
};
