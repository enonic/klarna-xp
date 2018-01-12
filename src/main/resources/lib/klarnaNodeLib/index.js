var contentLib = require('/lib/xp/content');
var contextLib = require('/lib/xp/context');
var nodeLib = require('/lib/xp/node');
var repoLib = require('/lib/xp/repo');
var portal = require('/lib/xp/portal');

module.exports = {
    list: list,
    deleteNode: deleteNode,
    createNode: createNode,
    modifyNode: modifyNode,
    query: query,
    get: get,
    listCarts: listCarts,
    listOrders: listOrders,
    deleteCarts: deleteCarts,
    deleteOrders: deleteOrders
};

function list(contentListCsv) {
    var contentList = (contentListCsv + "").split(',');
    var content = [];
    contentList.forEach(function (contentKey) {
        var c = contentLib.get({
            key: contentKey
        });
        content.push(c);
    });

    return content;
}

function deleteNode(contentId) {
	
	var repo = connectKlarnaRepo();
    
    var branch = contextLib.get().branch;
    contextLib.run({
        branch: 'draft',
        user: {
            login: 'su',
            userStore: 'system'
        }
    }, function () {
    	contentLib.unpublish({
    		keys: [contentId]
    	});
    	
        repo.delete(contentId);
        //publish(contentId, branch);
    });
}

function createNode(params) {
    if (!params) throw "Cannot create content. Missing parameter: params";
    if (!params.path) throw "Cannot create content. Missing parameter: path";
    if (!params.type) throw "Cannot create content. Missing parameter: type";
    if (!params.data) throw "Cannot create content. Missing parameter: data";
    
    
    var site = portal.getSite();
    
    try {
        var branch = contextLib.get().branch;
        return contextLib.run({
            branch: 'draft',
            user: {
                login: 'su',
                userStore: 'system'
            }
        }, function () {

        	var repo = connectKlarnaRepo();
        	
        	// ----- Checks if the corresponding folder node exists. If it does not, it creates it before trying to create a node inside of it. ----------- 
            var retrievedNode = repo.get(params.path);
            
            if (!retrievedNode)
            {
            	var folder = repo.create({
            		_name: params.path.replace("/", ""),
            		type: "base:folder"
            	});
            }
            // --------------------------------------------------------------------------------------------------------------------------------------------
        	
            var newNode = repo.create({
                _parentPath: params.path,
                type: app.name + ":" + params.type,
                data: params.data
            });
        	publish(newNode._id, contextLib.get().branch);
        	return newNode;        	        	
        });
    } catch (e) {
        if (e.code == 'contentAlreadyExists') {
            log.error('There is already a content with that name');
        } else {
            log.error('Unexpected error: ' + e.message);
        }
    }
}

function modifyNode(params) {
    if (!params) throw "Cannot create content. Missing parameter: params";
    if (!params.id) throw "Cannot create content. Missing parameter: id";
    if (!params.editor) throw "Cannot create content. Missing parameter: editor";
    
    var branch = contextLib.get().branch;
    var modifiedContent;
    var site = portal.getSite();
    
    contextLib.run({
        branch: 'draft',
        user: {
            login: 'su',
            userStore: 'system'
        }
    }, function () {
    	
    	var repo = connectKlarnaRepo();        
        
        modifiedContent = repo.modify({
            key: params.id,
            editor: params.editor
        });

        if(params.targetPath){
        	
        	// ----- Checks if the corresponding folder node exists. If it does not, it creates it before trying to create a node inside of it. ----------- 
            var retrievedNode = repo.get(params.targetPath);
            
            if (!retrievedNode)
            {
            	var folder = repo.create({
            		_name: params.targetPath.replace("/", ""),
            		type: "base:folder"
            	});
            }
        	
            modifiedContent = repo.move({
                source: params.id,
                target: params.targetPath + "/" + modifiedContent._name
            });
        }

        publish(modifiedContent._id, branch);
    });
    
    return modifiedContent;
}

function publish(key, branch) {
	
	var repo = connectKlarnaRepo();
    
	if (branch == 'master') {
        repo.push({keys: [key], target: 'master'});
    }
}

function query(queryString, type) {
	
	var queryResult;
	
	contextLib.run({
        branch: 'draft',
        user: {
            login: 'su',
            userStore: 'system'
        }
    }, function () {
    	
    	var repo = connectKlarnaRepo();
        
    	queryResult = repo.query({
        	query: queryString,
        	count: -1,
        	filters: {
                boolean: {
                    must: {
                        exists: {
                            field: "type"
                        },
                        hasValue: {
                            field: "type",
                            values: [type]
                        }	
                    }
                }
        	}
        });
    	
    	var hits = [];
    	
    	queryResult.hits.forEach(function(el){
    		hits.push(get(el.id));
    	});
    	
    	queryResult.hits = hits;
    });
	
	
	return queryResult;	
}

function get(id) {
	
	var node;
	
	contextLib.run({
        branch: 'draft',
        user: {
            login: 'su',
            userStore: 'system'
        }
    }, function () {
    	
    	var repo = connectKlarnaRepo();
        
    	node = repo.get(id);
    });
	
	return node;
}

function listCarts() {
	var carts = query("_path LIKE '/shopping-carts/*'", "no.seeds.klarna:cart");
	
	return carts.hits;
}

function listOrders() {
	var carts = query("_path LIKE '/orders/*'", "no.seeds.klarna:cart");
	
	return carts.hits;
}

function deleteCarts(){
	var carts = query("_path LIKE '/shopping-carts/*'", "no.seeds.klarna:cart");
	
	if (carts.hits){		
		carts.hits.forEach(function(el){
			deleteNode(el._id);
		});
	}
}

function deleteOrders(){
	var carts = query("_path LIKE '/orders/*'", "no.seeds.klarna:cart");
	
	if (carts.hits){		
		carts.hits.forEach(function(el){
			deleteNode(el._id);
		});
	}
}

function connectKlarnaRepo(){
	// Checks if klarna-repo exists. If not, it creates it
	var retrievedRepo = repoLib.get('klarna-repo');

	if (retrievedRepo) {
	   
	} else {
	    var newRepo = repoLib.create({
	        id: 'klarna-repo'
	    });
	}
	
	// Connect to repo
    var repo = nodeLib.connect({
        repoId: "klarna-repo",
        branch: "master"
    });
    
    return repo;
}
