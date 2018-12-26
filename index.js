(function(){

    const shouldLog = false;

    const second = 1000;
    const minute = 60000;
    const hour = minute * 60;

    const runSeconds = 0.5;
    const runMinutes = 1;
    const runHours = 5;

    // const intervalTime = minute * runMinutes;
    // const clearIntervalTime = hour * runHours;

    const intervalTime = second * runSeconds;
    const clearIntervalTime = null;
    // const clearIntervalTime = intervalTime + 6000;

    console.log('[autoInteractionProcess] :: Running');
    console.log(`  - Every ${runSeconds} Second(s)`);
    // console.log(`  - Every ${runMinutes} Minute(s)`);
    // console.log(`  - For ${runHours} Hour(s)`);
    console.log('\n\n');


    function shouldSkip(){
        return location.pathname.indexOf('/watch') !== 0
    }

    const interactionItems = {
        skip_into_button: {
            order: 1,
            name: 'Skip Intro Button',
            untilNextRun: 2000,
            lastRunTime: null,
            skip: false,
            essential: true,
            wait: 0,
            find: {
                in: null,
                it(inElement = document.body){
                    return helpers.findElement([
                        helpers.byTagName('a'),
                        helpers.byAttribute('aria-label', 'Skip Intro'),
                    ], inElement)
                }
            },
            action(el){
                el.click();
                shouldLog && console.log('    - Clicked');
            }
        },
        // background: {
        //     order: 2,
        //     name: 'Background',
        //     // untilNextRun: 2000,
        //     // lastRunTime: null,
        //     skip: false,
        //     essential: true,
        //     wait: 500,
        //     find: {
        //         in: null,
        //         it(inElement = document.body){
        //             return helpers.findElement([
        //                 helpers.byClassName('center-controls')
        //             ], inElement)
        //         },
        //     },
        //     action(el){
        //         el.click();
        //         console.log('    - Clicked');
        //     }
        // }
    };

    const interactions = [];

    Object.keys(interactionItems).forEach(interactionKey => {
        const interaction = interactionItems[interactionKey];

        interaction.key = interactionKey;
        interactions.push(interaction)

    });

    interactions.sort(function(a, b) {
        return a.order - b.order;
    });

    let runCount = 0;

    const interactionInterval = setInterval(async function(){

        shouldLog && console.info('[autoInteractionProcess] :: Do Interactions');

        runCount++;

        let previousElement = null;

        if(shouldSkip()){
            shouldLog && console.log('  ... Interval Skipped');
            return;
        }

        const actions = [];

        for(const _do of interactions){

            if(_do.skip) continue;

            if(_do.untilNextRun && _do.lastRunTime){
                const sinceLastRun = Date.now() - _do.lastRunTime;
                if(_do.untilNextRun > sinceLastRun){
                    console.log(`  ... Waiting For Skip Period:`, _do.name);
                    console.log(`    - ${_do.untilNextRun}ms`, sinceLastRun);
                    console.log(' ');
                    return;
                }
            }

            let inElement = null;

            switch(_do.find.in){
                case 'previousElement':
                    inElement = previousElement;
            }

            const element = _do.find.it(inElement || document.body);
            previousElement = element;

            if(element === null) {
                shouldLog && console.warn('  • NOT Found:', _do.name);
                if(_do.essential) {
                    shouldLog && console.warn('    - Essential Element ... skipping interaction');
                    return;
                } else {
                    continue;
                }
            }

            if(_do.wait){
                shouldLog && console.log(`  ... Waiting To Do Next Interaction: ${_do.wait}ms`);
            }

            console.log('  • Found:', _do.name);

            _do.lastRunTime = Date.now();

            actions.push({
                info: '',
                run(){
                    return new Promise((resolve) => {
                        setTimeout(() => {

                            if(_do.action){
                                _do.action(element);
                            }

                            console.log(' ');

                            resolve(true);

                        }, _do.wait || 0)
                    })
                }
            });

        }

        for(const action of actions){
            await action.run();
        }

        shouldLog && console.log('Interactions Completed');
        shouldLog && console.log(' ');

        return true

    }, intervalTime);

    if(clearIntervalTime){
        setTimeout(() => {
            shouldLog && console.warn('[autoInteractionProcess] :: Clearing Interaction Interval');
            clearInterval(interactionInterval)
        }, clearIntervalTime);
    }


    const helpers = {

        byClassName(className){
            return function(node){
                if(node.className && node.className.indexOf){
                    if(node.className.indexOf(className) > -1){
                        return true;
                    }
                }
                return false
            }
        },

        byInnerText(text){
            return function(node){
                return node.innerText && node.innerText === text
            }
        },

        byAttribute(key, value){
            return function(node){
                if(node.attributes && node.attributes[key]){
                    return node.attributes[key].value === value;
                }
                return false
            }
        },

        byTagName(tag){
            return function(node){
                return node.localName === tag
            }
        },

        findElement(methods, searchNode = document.body){
            let element = null;
            helpers.searchDOM(searchNode, (node) => {
                let found = 0;
                for(const method of methods){
                    if(method(node)) found++;
                }
                if(found === methods.length){
                    element = node;
                    return true
                }
                return false
            });
            return element;
        },

        searchDOM (node, found) {
            if(found(node)) return;
            node = node.firstChild;
            while(node) {
                helpers.searchDOM(node, found);
                node = node.nextSibling;
            }
        },

    };

    return true
})();
