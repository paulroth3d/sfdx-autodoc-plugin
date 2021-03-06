/*jshint esversion: 6*/

const Q = require('q');
const _ = require('underscore');
const child_process = require('child_process');
const jsForce = require('jsforce');

/** The default API version to use. */
const DEFAULT_API_VERSION = '40.0';

/**
 * Class that represents a salesforce DX Connection
 * 
 * @class DxConnection
 */
class DxConnection {

  /**
   * Creates an instance of DxConnection.
   * @memberof DxConnection
   */
  constructor(apiVersion){
    this.connection = null;
    this.lastAlias = null;
    if (!apiVersion){
      this.apiVersion = DEFAULT_API_VERSION;
    } else {
      this.apiVersion = apiVersion;
    }
  }

  /**
   * Determines whether there is a connection available (true) or not (false)
   * 
   * @returns {boolean}
   * @memberof DxConnection
   */
  hasConnection(){
    return(this.connection?true:false);
  }
  
  /**
   * Remembers the last access token found for 
   * 
   * @returns {q.promise<jsForce.Connection>} - most recent jsForce connection
   * @memberof DxConnection
   */
  getConnection(){
    //-- @TODO: review whether the refresh should be bound into this
    //-- as a failsafe.

    return(this.connection);
  }

  /**
   * Determines the current access token for a given connection.
   * 
   * @param {string} alias - connection alias
   * @returns {q.promise<jsForce.Connection>} - current access token.
   * @memberof DxConnection
   */
  refreshConnection(alias){
    const deferred = Q.defer();
    let self = this;

    if (!alias){
      alias = this.lastAlias;
    }

    if (!alias){
      deferred.reject('Alias must be required to refresh a connection',null);
      return;
    }

    child_process.exec(`sfdx force:org:display -u ${alias} --json`, function(err, stdout){
      if (err){
        deferred.reject('Error occurred while accessing user alias:' + alias);
        return;
      }
      const {accessToken, instanceUrl} = JSON.parse(stdout).result;

      self.connection = new jsForce.Connection({
        instanceUrl: instanceUrl,
        accessToken: accessToken
      });

      self.lastAlias = alias;

      deferred.resolve(self.connection);
    });

    return deferred.promise;
  }
}

module.exports = DxConnection;
DxConnection.DEFAULT_API_VERSION = DEFAULT_API_VERSION;