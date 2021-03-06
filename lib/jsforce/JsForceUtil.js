/*jshint esversion: 6*/

const Q = require('q');
const FS = require('fs-extra');
const _ = require('underscore');
const DxConnection = require('../dx/DxConnection');

/**
 * Supporting wrapper around the jsForce utility class.
 * 
 * @class JsForceUtil
 */
class JsForceUtil {

  /**
   * Lists all the metadata api types for a connection
   * 
   * @param {DxConnection} dxConn 
   * @memberof JsForceUtil
   */
  getAllTypes(dxConn){
    const deferred = Q.defer();
    
    //console.log('attempt to get all metadata types'); debugger;

    dxConn.getConnection().metadata.describe( dxConn.apiVersion, function(err, metadata){
      if (err){
        deferred.reject('Error occurred during describe', err);
        return;
      }
      
      deferred.resolve(metadata);
    });

    return (deferred.promise);
  }

  /**
   * Lists all metadata members for a given type.
   * <p>See: https://jsforce.github.io/document/#list-metadata</p>
   * 
   * @param {DxConnection} dxConn 
   * @param {string} type 
   * @param {string} folder 
   * @returns {q.promise} - jsForce listMetadata results
   * @memberof JsForceUtil
   */
  getTypeMembers(dxConn, type, folder){
    const deferred = Q.defer();

    if (!folder){
      folder = '';
    }

    let queryObj = {
      'type': type,
      'folder': folder
    };

    dxConn.getConnection().metadata.list(queryObj, dxConn.apiVersion, function(err, metadata){
      if (err){
        deferred.reject('Error while retrieving members for type:' + type, err);
        return;
      }

      deferred.resolve(metadata);
    });

    return (deferred.promise);
  }

  /**
   * Determines and sorts the types to a printable format.
   * 
   * @param {any} jsForceAllTypeResults - collection of jsForce metadata API list results.
   * @return {q.promise} - promise(string[]) - collection of names
   * @memberof JsForceUtil
   */
  printAllTypeNames(jsForceAllTypeResults){
    const deferred = Q.defer();
    const self = this;

    let metadataTypes = jsForceAllTypeResults.metadataObjects;
    let metadataType;

    let metadataNames = [];
    let metadataName;

    for (var i = 0; i < metadataTypes.length; i++){
      metadataType = metadataTypes[i];
      metadataName = metadataType.xmlName;
      if (metadataType.inFolder){
        metadataName += '*';
      }
      metadataNames.push(metadataName);
    }

    const sortedNames = self.sortAndPrintList(metadataNames, '-- no types found --');

    deferred.resolve(sortedNames);

    return deferred.promise;
  }

  /**
   * Determines and sorts the members to a printable format.
   * 
   * @param {any} typeMembers - collection of jsForce metadata API list results.
   * @return {q.promise} - promise(string[]) - collection of names
   * @memberof JsForceUtil
   */
  printMemberNames(typeMembers){
    const deferred = Q.defer();
    const self = this;

    const results = [];

    let metadataType;
    let metadataTypeName;

    let metadataTypeNames = [];

    if (!typeMembers || typeMembers.length < 1){
      deferred.resolve(results);
      return (deferred.promise);
    }

    for (var i = 0; i < typeMembers.length; i++){
      metadataType = typeMembers[i];
      metadataTypeName = metadataType.fullName;
      metadataTypeNames.push(metadataTypeName);
    }

    const sortedNames = self.sortAndPrintList(metadataTypeNames, '-- no member entries found --');
    deferred.resolve(sortedNames);

    return (deferred.promise);
  }

  /**
   * Sorts and prints entries from a list
   * 
   * @param {string[]} list - collection of items to print
   * @param {string} messageIfEmptyList - message to provide if list is empty
   * @memberof JsForceUtil
   */
  sortAndPrintList(list, messageIfEmptyList){
    if (!list || list.length < 1){
      console.log(messageIfEmptyList);

      return list;
    } else {
      const sortedList = _.sortBy(list, function(str){
        return (str);
      });

      for (var j = 0; j < sortedList.length; j++){
        console.log(sortedList[j]);
      }

      return sortedList;
    }
  }
}

module.exports = new JsForceUtil();