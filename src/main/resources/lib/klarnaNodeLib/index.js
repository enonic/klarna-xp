var contentLib = require('/lib/xp/content');
var contextLib = require('/lib/xp/context');
var nodeLib = require('/lib/xp/node');
var portal = require('/lib/xp/portal');

module.exports = {
    list: list,
    deleteContent: deleteContent,
    createContent: createContent,
    modifyContent: modifyContent,
    query: query,
    get: get,
    listCarts: listCarts,
    listOrders: listOrders
};

function list(contentListCsv) {
	
	// Connect to repo
    var repo = nodeLib.connect({
        repoId: "cms-repo",
        branch: "draft"
    });
    
    var contentList = (contentListCsv + "").split(',');
    var content = [];
    contentList.forEach(function (contentKey) {
        var c = repo.get(contentKey);
        content.push(c);
    });

    return content;
}

function deleteContent(contentId) {

	// Connect to repo
    var repo = nodeLib.connect({
        repoId: "cms-repo",
        branch: "draft"
    });
    
    var branch = contextLib.get().branch;
    contextLib.run({
        branch: 'draft',
        user: {
            login: 'su',
            userStore: 'system'
        }
    }, function () {
        repo.delete(contentId);
        publish(contentId, branch);
    });
}

function createContent(params) {
    if (!params) throw "Cannot create content. Missing parameter: params";
    if (!params.name) throw "Cannot create content. Missing parameter: name";
    if (!params.path) throw "Cannot create content. Missing parameter: path";
    if (!params.displayName) throw "Cannot create content. Missing parameter: displayName";
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

        	// Connect to repo
        	var repo = nodeLib.connect({
                repoId: "cms-repo",
                branch: "draft"
            });
        	
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
                _name: params.name,
                _parentPath: params.path,
                type: app.name + ":" + params.type,
                displayName: params.displayName,
                valid: true,
                creator: contextLib.get().authInfo.principals[contextLib.get().authInfo.principals.length - 1],        
                createdTime: new Date(),
                _nodeType: "content",
                _childOrder: "modifiedtime DESC",
                _inheritsPermissions: true,
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

function modifyContent(params) {
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
    	
    	// Connect to repo
        var repo = nodeLib.connect({
            repoId: "cms-repo",
            branch: "draft"
        });
        
        
        modifiedContent = repo.modify({
            key: params.id,
            editor: params.editor
        });

        if(params.targetPath){
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
	
	// Connect to repo
    var repo = nodeLib.connect({
        repoId: "cms-repo",
        branch: "draft"
    });
    
    log.info("**** Branch -> " + branch);
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
    	// Connect to repo
        var repo = nodeLib.connect({
            repoId: "cms-repo",
            branch: "draft"
        });
        
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
    	// Connect to repo
        var repo = nodeLib.connect({
            repoId: "cms-repo",
            branch: "draft"
        });
        
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
