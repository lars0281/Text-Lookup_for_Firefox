
console.log("start TextLookup background");


let indexedDB;

// databases:

// May 10 2021


/*
 * Send selected text to a searchengine (configurable, default to
 * duckduckgo.com) Present message box with top three (configurable) search
 * reults.
 */


// context menu related



/*
 * Add context menu item for selection. User may select a text and have this
 * menuitem appear when righ-cliking on the selection The selection is sent
 * verbatim to search engine and top three results are presented in a message
 * box. Added in v 1.1
 */
 browser.contextMenus.create({
 id: "selected-text-lookup",
 title: "send text to search engine",
 contexts: ["selection"]
 });




indexedDB = window.indexedDB || window.webkitIndexedDB ||
    window.mozIndexedDB || window.msIndexedDB;

// listener for message sent from the admin page of the plugin
browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	   console.log("message:" + JSON.stringify(message));
	   console.log("sender:" + JSON.stringify(sender));
	   console.log("sendResponse:" + sendResponse);

    console.log("received from page:  message: " + JSON.stringify(message) + " message.type=" + message.type);

    
    console.log("request:" + message[0]);
    console.log("request:" + message.request);

    console.log("request:" + JSON.stringify(message.request));
    console.log("request:" + JSON.stringify(message.request.sendRule));

    console.log("request:" + message.request.sendRule);

    console.log("request:" + message.linkurl);

    try {

        if (message.request.sendRule == 'toEditPopup') {
            console.log("contact edit popup:");

            var page_message = message.message;
            console.log("page_message:" + page_message);
            // Simple example: Get data from extension's local storage
            // var result = localStorage.getItem('whatever');
            
            
            
            var result = JSON.parse('{"test":"one"}');
            // Reply result to content script
            sendResponse(result);
        }

    
} catch (e) {
    console.log(e);
}

    try {

    	// make call to rule editing popup containing the rule to display in it.
    	
    	
    	
    	
        if (message && message.type == 'page') {
            console.log("page_message:");
            var page_message = message.message;
            console.log("page_message:" + page_message);
            // Simple example: Get data from extension's local storage
            // var result = localStorage.getItem('whatever');
            var result = JSON.parse('{"test":"one"}');
            // Reply result to content script
            sendResponse(result);
        }

        if (message && message.request == 'skinny_lookup' && message.linkurl != '') {
            console.log("look up :" + message.linkurl);
            var true_destination_url = "";
            true_destination_url = skinny_lookup(message.linkurl);
            sendResponse({
                true_destination_url: true_destination_url,
                linkUrl: message.linkurl,
                success: "true"
            });
        }
    } catch (e) {
        console.log(e);
    }

});

if (!window.indexedDB) {
    console.log("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
} else {
    console.log("1.1.0");
}

let pendingCollectedUrls = [];

browser.contextMenus.onClicked.addListener((info, tab) => {
    console.log("background.js: browser.contextMenus.onClicked.addListener");
    console.log("background.js: browser.contextMenus.onClicked.addListener:info:" + JSON.stringify(info));
    console.log("background.js: browser.contextMenus.onClicked.addListener:tab:" + JSON.stringify(tab));

    /*
	 * When the user has selected from the context meny to revel the true end
	 * point of a url
	 * 
	 */
    if (info.menuItemId == "glovebox-link-reveal") {
        console.log("glovebox-link-reveal");
        // console.log(info);
        // console.log(tab);
        reveal_true_url_endpoint(info, tab);

    }else if (info.menuItemId == "selected-text-lookup") {
        console.log("selected-text-lookup");
        // console.log(info);
        // console.log(tab);
        selected_text_lookup(info, tab);

    }

    
    
    
    
    console.log("#### request completed");
});

// add listener to open the admin page when user clicks on the icon in the
// toolbar
browser.browserAction.onClicked.addListener(() => {
    // use this functionality to get a full tabpage
    browser.tabs.create({
        url: "/rule-admin.html"
    });
    // Can replace the above with a direct referal to the html, in the manifest.
    // - but this would not provide a full tab-page
    // "brower_action": {
    // "default_popup": "navigate-collection.html"

});


var request = indexedDB.open("sourceFulldomainRuleDB", 1);
request.onupgradeneeded = function (event) {
    db = event.target.result;
    db.onerror = function (event) {};
    // Create an objectStore in this database to keep trusted decryption
    // keys
    console.log("create objectstore sourceFulldomainRuleStore in sourceFulldomainRuleDB");
    var objectStore2 = db.createObjectStore('sourceFulldomainRuleStore', {
            keyPath: 'keyId'
        });

    objectStore2.createIndex('keyId', 'keyId', {
        unique: true
    });
};
request.onerror = function (event) {
    console.log("dp open request error 201");
};
request.onsuccess = function (event) {
    db = event.target.result;
    db.onerror = function (event) {
        console.log("db open request error 2");
    };
    db.onsuccess = function (event) {
        console.log("db open request success 2");
    };
};



// add defaults

generate_default_parameters();




/*
 * 
 */

function selected_text_lookup(info, tab) {
	  console.log("#start: selected_text_lookup");
	  console.log(info);
	  console.log(tab);
}

// receive notice when user rightclick on a link and selects "reveal the true
// endpoint of URL"

// make call back to page script to run additonal code


function reveal_true_url_endpoint(info, tab) {
 // console.log("#start: reveal_true_url_endpoint");
 // console.log(info);
 // console.log(tab);

  // console.log("###calling ");
    // console.log(destination_url_rules);

    // information on which link was selected, use this to correctly
    // identify it in the content script.

    var tabId = tab.id;
    var frameId = info.frameId;
    var targetElementId = info.targetElementId;

    var linkUrl = info.linkUrl;
    var linkText = info.linkText;

    console.log("urlendpoint: " + info.linkUrl);
   // console.log("tabId: " + tabId);

    console.log("location page: " + info.pageUrl);

    var true_destination_url = "";

    // setup a ruleset. With some default values and adilito for user to
    // configure automatic behaviour.


    var new_url = info.linkUrl;
   // console.log("#### " + new_url);

    // apply rules to generate new URL. The rules are a collection of
    // rewrite statements applied to the submitted URL.
    // The rules are scoped in two ways: by source/destination and complete
    // URL (protocol fully-qualified domain port path), full domain
    // (protocol fully-qualified domain port ) and domain ( domain port )
    // The rewrite rules are applied in sequentially.

    // The source rules (if any) are applied first.

    // Then the destination rules are applied. And on top of any changes
    // made previosuly.

    // Two URLs are submitted: the URL of the page where the link is found,
    // and the link itself.


    // new_url = "";
    rules_enforcement(info.pageUrl, new_url).then(function(re){
    	  // console.log("#### " + re);

  		new_url = re;
    	
    
    console.log("#### after first rewrite: " + new_url);
    // if the rules caused the URL to be changed, there might also be rules
    // governing the new URL, so run through it again.

    return rules_enforcement(info.pageUrl, new_url);
    }).then(function (re){
    	new_url = re;
    console.log("#### after second rewrite: " + new_url);
    

    // new_url = rules_enforcement(info.pageUrl ,new_url);
    // console.log("#### " + new_url);

    // Call the URL by default if not rules applies to the URL.
    // If the URL has not been changed, assume no rule pertained to it, so
    // look it up directly.


    // console.log("true_destination_url: " + true_destination_url );


    // check linkURL against URL


    // send message back to the content script with this info

    return getRedirectUrl(new_url);

}).then(function (url) {

        // verify that the URL satify the minimum requirements
        var url_wellformed_regexp = /.*/i;

        // console.log(url_wellformed_regexp);
        // console.log("url_wellformed_regexp.text("+url+"): " +
        // url_wellformed_regexp.test(url));
        if (url.length > 9 && url_wellformed_regexp.test(url)) {
            true_destination_url = url;
        } else {
            true_destination_url = new_url;
        }

        // make attempt to clean the URL returned. In case of URL shorteners,
        // any manner of "villany" may be lurking
        
        return rules_enforcement(info.pageUrl, true_destination_url);
    }).then(function (res) {
console.log(res);
         true_destination_url = res;
        

        return browser.tabs.executeScript(tabId, {
            file: "content_scripts/RevealUrl.js",
            frameId: frameId
        });

    }).then(function (result) {

        // query for the one active tab
        return browser.tabs.query({
            active: true,
            currentWindow: true
        });

    }).then(function (tabs) {
// console.log(tabs);
        // send message back to the active tab
        console.log("#call back to content script");
        return browser.tabs.sendMessage(tabs[0].id, {
            targetElementId: targetElementId,
            true_destination_url: true_destination_url,
            linkText: linkText,
            linkUrl: linkUrl,
            success: "true"
        });
        // }).then(function (res) {
        // console.log("###### getHTML response " + JSON.stringify(res));
        // glovebox_token_ciphertext = res.response.token;

    });

}

function getRedirectUrl(url) {
    // console.log("##### getRedirectUrl.start: " + url);
    try {
        var p = new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('HEAD', url, true);
                xhr.responseType = 'blob';
                xhr.onload = function () {
                    // resolve(xhr.response);
                    var reader = new FileReader();
                    console.log(xhr.response);
                    console.log(xhr);

                    // check for a Location HTTP header in the response
                    // console.log(xhr.responseURL);

                    var redirectURL = "";

                    redirectURL = xhr.responseURL;
                    // consider also looking for a html-based redirect in the
                    // body of the retruend document.

                    // consider making this recursive, by calling the redirect
                    // URL to see if it results in another redirect


                    reader.readAsDataURL(xhr.response);
                    reader.onload = function (e) {

                        resolve(redirectURL);

                    };

                };

                xhr.onerror = () => reject(xhr.statusText);
                xhr.send();
            });
        return p;
    } catch (e) {
        console.log(e);
    }
}


function destination_rules_enforcement(location, linkurl){
	
	/*
	 * This is subject to rewriting, for now, accept the parameter for the
	 * location of the link to be rewritten, but do not use the value for
	 * anything
	 */
	
console.log("# destination_rules_enforcement begin");
	
    var new_url = linkurl;

    return new Promise(
        function (resolve, reject) {
        	console.log("# destination_rules_enforcement begin promise");

        // use this to lookup any rules that may apply to links found on the
		// page of
        // this url
        var protocolfulldomainportpath = "";
        protocolfulldomainportpath = linkurl.replace(/^(http[s]*:\/\/)([^\/]*\/)([^\?]*).*/i, '$1$2$3');

        var protocolfulldomainport = "";
        protocolfulldomainport = linkurl.replace(/^(http[s]*:\/\/)([^\/]*\/)([^\?]*).*/i, '$1$2');

        // lookup rules for this location domain ("top"-level example domain.com
		// )
        // ignoring the first word in the fully qualified domain name

        var domainport = "";
        domainport = linkurl.replace(/^http[s]*:\/\/[^\.]*\.([^\/]*)\/([^\?]*).*/i, '$1');

        // sourceDomainRuleStore in sourceDomainRuleDB
        // sourceFulldomainRuleStore in sourceFulldomainRuleDB
        // create objectstore sourceUrlRuleStore in sourceUrlRuleDB");
        console.log("lookup: " + domainport);
        
        try {

            loadFromIndexedDB_async("destinationDomainRuleDB", "destinationDomainRuleStore", domainport).then(function (three) {
                console.log("########## 0");
          // console.log(three);

                if (three) {
            console.log("carry out rule on: " + new_url);
                    new_url = execute_rule(three, new_url);
                }

                // if anything returned, apply it

                // proceed with looking for more rules scopde for
				// protocolfulldomainport

                return loadFromIndexedDB_async("destinationFulldomainRuleDB", "destinationFulldomainRuleStore", protocolfulldomainport);
            }).then(function (one) {

                console.log("########## 1");
           // console.log(one);
                if (one) {
                    console.log("carry out rule on: " + new_url);
                    new_url = execute_rule(one, new_url);

                }

                return loadFromIndexedDB_async("destinationUrlRuleDB", "destinationUrlRuleStore", protocolfulldomainportpath);
            }).then(function (two) {
                console.log("########## 2");
            // console.log(two);
                if (two) {
                    console.log("carry out rule on: " + new_url);
                    new_url = execute_rule(two, new_url);
                }

                console.log("# # # #  resolve new_url: " + new_url);
            	console.log("# destination_rules_enforcement promise resolved");

                resolve(new_url);

            });

        } catch (e) {
            console.log(e);

            console.log("# # # # new_url: " + new_url);
        	console.log("# destination_rules_enforcement promise resolved");
            resolve(new_url);

        }

    });

	
}




function loadFromIndexedDB_async(dbName, storeName, id) {
  // console.log("loadFromIndexedDB:0");
  // console.log("loadFromIndexedDB:1 " + dbName);
  // console.log("loadFromIndexedDB:2 " + storeName);
  // console.log("loadFromIndexedDB:3 " + id);

    return new Promise(
        function (resolve, reject) {
        var dbRequest = indexedDB.open(dbName);

        dbRequest.onerror = function (event) {
            reject(Error("Error text"));
        };

        dbRequest.onupgradeneeded = function (event) {
            // Objectstore does not exist. Nothing to load
            event.target.transaction.abort();
            reject(Error('Not found'));
        };

        dbRequest.onsuccess = function (event) {
            // console.log("loadFromIndexedDB:onsuccess ");

            var database = event.target.result;
            var transaction = database.transaction([storeName]);
            // console.log("loadFromIndexedDB:transaction: " +
            // JSON.stringify(transaction));
            var objectStore = transaction.objectStore(storeName);
            // console.log("loadFromIndexedDB:objectStore: " +
            // JSON.stringify(objectStore));
            var objectRequest = objectStore.get(id);

            // console.log("loadFromIndexedDB:objectRequest: " +
            // JSON.stringify(objectRequest));


            try {

                objectRequest.onerror = function (event) {
                    // reject(Error('Error text'));
                    reject('Error text');
                };

                objectRequest.onsuccess = function (event) {
                    if (objectRequest.result) {
   // console.log("loadFromIndexedDB:result " +
	// JSON.stringify(objectRequest.result));

                        resolve(objectRequest.result);
                    } else {
                        // reject(Error('object not found'));
                        resolve(null);

                    }
                };

            } catch (error) {
                console.log(error);

            }

        };
    });
}





function generate_default_parameters() {

    console.log("generate_default_parameters begin");

    // add rule objects to database
    try {
        var p = [];
        p.push(saveToIndexedDB_async('sourceFulldomainRuleDB', 'sourceFulldomainRuleStore', 'keyId', {
                keyId: 'https://www.google.com/',
                sourceFulldomain: 'https://www.google.com/',
                url_match: 'https://www.google.com/',
                scope: 'Fulldomain',
                direction: 'source',
                steps: [{
                        procedure: "qs_param",
                        parameters: [{
                                value: "url",
                                notes: "read url from querystring"
                            }
                        ],
                        notes: "grab the url parameter from the querystring"
                    }, {
                        procedure: "uri_decode",
                        parameters: [],
                        notes: "uri decode"
                    }
                ],
                notes: '',
                createtime: '202001010001'
            }));
      
        p.push(saveToIndexedDB_async('destinationUrlRuleDB', 'destinationUrlRuleStore', 'keyId', {
                keyId: 'https://www.flysas.com/en/flexible-booking/',
                destinationUrl: 'https://www.flysas.com/en/flexible-booking/',
                url_match: 'https://www.flysas.com/en/flexible-booking/',
                scope: 'Url',
                direction: 'destination',
                steps: [{
                        procedure: "regexp",
                        parameters: [{
                                value: "s/eCodsId=[^&]*//g",
                                notes: "sed-type regexp statement to delete CodsId from url"
                            }
                        ],
                        notes: "remove piece of querystring"
                    }
                ],
                notes: 'SAS tracing offers',
                createtime: '202001010001'
            }));

        console.log(p);
        // Using .catch:
        Promise.all(p)
        .then(values => {
            console.log(values);
        })
        .catch(error => {
            console.error(error.message)
        });

    } catch (f) {
        console.log(f);
    }
}


function saveToIndexedDB_async(dbName, storeName, keyId, object) {

    console.log("saveToIndexedDB_async:dbname " + dbName);
    console.log("saveToIndexedDB_async:objectstorename " + storeName);
    console.log("saveToIndexedDB_async:keyId " + keyId);
    console.log("saveToIndexedDB_async:object " + JSON.stringify(object));

    // indexedDB = window.indexedDB || window.webkitIndexedDB ||
    // window.mozIndexedDB || window.msIndexedDB;

    return new Promise(
        function (resolve, reject) {

        // console.log("saveToIndexedDB: 0 resolve=" + resolve )
        // console.log("saveToIndexedDB: 0 reject=" + reject )

        // if (object.taskTitle === undefined)
        // reject(Error('object has no taskTitle.'));

        var dbRequest;

        try {

            dbRequest = indexedDB.open(dbName);
        } catch (error) {
            console.log(error);

        }
        console.log("saveToIndexedDB_async: 1 dbRequest=" + dbRequest);

        dbRequest.onerror = function (event) {
            console.log("saveToIndexedDB:error.open:db " + dbName);
            reject(Error("IndexedDB database error"));
        };

        console.log("saveToIndexedDB: 2" + JSON.stringify(dbRequest));

        dbRequest.onupgradeneeded = function (event) {
            console.log("saveToIndexedDB: 21");
            var database = event.target.result;
            console.log("saveToIndexedDB:db create obj store " + storeName);
            var objectStore = database.createObjectStore(storeName, {
                    keyId: keyId
                });
        };

        console.log("saveToIndexedDB: 3" + JSON.stringify(dbRequest));
        try {

            dbRequest.onsuccess = function (event) {
                console.log("saveToIndexedDB: 31");
                var database = event.target.result;
                console.log("saveToIndexedDB: 32");
                var transaction = database.transaction([storeName], 'readwrite');
                console.log("saveToIndexedDB: 33");
                var objectStore = transaction.objectStore(storeName);
                console.log("saveToIndexedDB:objectStore put: " + JSON.stringify(object));

                var objectRequest = objectStore.put(object); // Overwrite if
                // already
                // exists

                console.log("saveToIndexedDB:objectRequest: " + JSON.stringify(objectRequest));

                objectRequest.onerror = function (event) {
                    console.log("saveToIndexedDB:error: " + storeName);

                    reject(Error('Error text'));
                };

                objectRequest.onsuccess = function (event) {
                    console.log("saveToIndexedDB:success: " + storeName);
                    resolve('Data saved OK');
                };
            };

        } catch (error) {
            console.log(error);

        }

    });
}
