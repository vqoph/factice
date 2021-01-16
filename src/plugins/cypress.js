const createActionsFromDB = require('../lib/actions/reducer');
const database = require('../lib/db/database');

module.exports = class FacticeCypressPlugin {
  /** @type {any} */
  #actions = {};

  /** @type {any} */
  #data = null;

  /**
   * @param {{data?: any, host?:string}} config
   */
  constructor({ data }) {
    if (data) {
      this.#data = data;
      this.#init(data);
    }
  }

  /**
   * Handle response and headers from factice data
   * @param {{resource: string, id?: string, query?: any, params?: any, protocol?:string, method?:string}} config
   */
  reply(config) {
    const { response } = this.#request(config);
    return (req) => req.reply(response);
  }

  /**
   * Return response and headers from factice data
   * @param {{resource: string, id?: string, query?: any, params?: any, protocol?:string, method?:string}} config
   */
  request(config) {
    return this.#request(config);
  }

  /**
   * Restore factice database with initial datas
   */

  reset() {
    this.#init(this.#data);
  }

  #init(data) {
    const db = database(data);
    this.#actions = createActionsFromDB(db);
  }

  #request({
    resource: resourceName,
    id = undefined,
    query = {},
    params = {},
    protocol = undefined,
    method = 'GET',
  }) {
    /** @type {{ model: LodashWrapper, methods: any }} */
    const action = this.#actions[resourceName];
    const mockReq = { query, params, protocol };

    if (resourceName.match(':id')) {
      if (id) {
        mockReq.params.id = id;
      } else {
        throw Error(
          'If you have an :id in your url you should specify an id parameter'
        );
      }
    }

    const result = action.methods[method.toLowerCase()](mockReq, {
      parentResourceName: null,
      parentId: null,
    });

    const headers = result.headers
      ? result.headers.reduce(
          (acc, { name, value }) => ({ ...acc, [name]: value }),
          {}
        )
      : {};
    return { response: result.value, headers };
  }
};
