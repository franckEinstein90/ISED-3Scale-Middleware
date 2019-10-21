https://' + tenantWithResource.admin_domain + '/admin/api/accounts/find?access_token=' + 
tenantWithResource.access_token + '&email=' + encodeURIComponent(tenant.authenticatedUser);



console.log("this is the url we are hitting " + url);
      
      
      tenant.authenticatedUser = email;

      getApis
      addAPIDocs
      getPlans
      validateUserByPlans
      validateApis

      const getPlans = function(tenant, cb) {

            let getPlansByUser = function(tenant) {
    
                var tenantWithResource = JSONALL.master.tenants.filter(function(el) {
    
                    return el.name === tenant.name;
                });
                tenantWithResource = tenantWithResource[0];
                const url = 'https://' + tenantWithResource.admin_domain + 
                '/admin/api/accounts/find?access_token=' + 
                tenantWithResource.access_token + '&email=' + 
                encodeURIComponent(tenant.authenticatedUser);
                
                
                console.log("this is the url we are hitting " + url);
                return new Promise(function(resolve, reject) {
                    rp.get(url)
                        .then(function(response) {
                            var jsonresp = xmlParser.toJson(response);
                            var jsonObj = JSON.parse(jsonresp);
                            tenant.plansforUser = jsonObj.account.plans.plan;
                            /*  console.log("these are the plans " );
                               console.log( jsonObj.account.plans.plan );
                              */
    
                            resolve();
                        }).catch(function(err) {
                            console.log("error while getting plans");
                            reject(err);
                        })
                })
            }
            var planCall = getPlansByUser(tenant);
            planCall.then(function() {
                    cb(null, tenant);
                })
                .catch(function(err) {
                    console.log("error while getting plans");
                    cb(null, tenant);
                })
        }


      