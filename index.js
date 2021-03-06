(function(){

    const minute = 60000;
    const hour = minute * 60;

    const runMinutes = 1;
    const runHours = 5;

    const intervalTime = minute * runMinutes;
    const clearIntervalTime = hour * runHours;

    // const intervalTime = minute / 4;
    // const clearIntervalTime = intervalTime + 6000;

    console.log('[autoInteractionProcess] :: Running');
    console.log(`  - Every ${runMinutes} Minute(s)`);
    console.log(`  - For ${runHours} Hour(s)`);
    console.log(' ');
    console.log(' ');

    const interactions = [
        {
            name: 'Dropdown Button',
            find: {
                in: null,
                it(inElement = document.body){
                    return findElement([
                        byClassName('menu-button'),
                    ], inElement)
                }
            },
            action(el){
                el.parentElement.click();
                console.log('    - Clicked');
            }
        },
        {
            name: 'Dropdown Menu',
            find: {
                in: null,
                it(inElement = document.body){
                    return findElement([
                        byClassName('menu__list zap-menu__list')
                    ], inElement)
                },
            },
        },
        {
            name: 'Run button',
            find: {
                in: 'previousElement',
                it(inElement = document.body){
                    return findElement([
                        byClassName('truncated-text truncated-text--block menu__label-text'),
                        byInnerText('Run')
                    ], inElement)
                },
            },
            action(el){
                el.parentElement.parentElement.click();
                console.log('    - Clicked');
            }
        },
        {
            name: 'Close Modal Button',
            find: {
                in: null,
                it(inElement = document.body){
                    return findElement([
                        byClassName('button button--large button--primary flat react-portal-modal__actions-button'),
                    ], inElement)
                },
            },
            wait: 5000,
            action(el){
                el.click();
                console.log('    - Clicked');
            }
        },
    ];

    const interactionInterval = setInterval(async function(){

        console.warn('[autoInteractionProcess] :: Do Interactions');

        let previousElement = null;

        for(const _do of interactions){

            if(_do.wait){
                console.log(`  ... Waiting To Do Next Interaction: ${_do.wait}ms`);
            }

            await (function(){
                return new Promise((resolve) => {
                    setTimeout(() => {

                        let inElement = null;

                        switch(_do.find.in){
                            case 'previousElement':
                                inElement = previousElement;
                        }

                        console.log('  • Searching For:', _do.name);

                        const element = _do.find.it(inElement || document.body);
                        previousElement = element;

                        if(element === null) {
                            console.error('    - NOT Found');
                            return;
                        }

                        console.log('    - Found');

                        if(_do.action){
                            _do.action(element);
                        }

                        console.log(' ');

                        resolve();

                    }, _do.wait || 0)
                })
            })();

        }

        console.log('Interactions Completed');
        console.log(' ');

        return true

    }, intervalTime);

    setTimeout(() => {
        console.warn('[autoInteractionProcess] :: Clearing Interaction Interval');
        clearInterval(interactionInterval)
    }, clearIntervalTime);


    function byClassName(className){
        return function(node){
            if(node.className && node.className.indexOf){
                if(node.className.indexOf(className) > -1){
                    return true;
                }
            }
            return false
        }
    }

    function byInnerText(text){
        return function(node){
            return node.innerText && node.innerText === text
        }
    }

    function findElement(methods, searchNode = document.body){
        let element = null;
        searchDOM(searchNode, (node) => {
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
    }

    function searchDOM (node, found) {
        if(found(node)) return;
        node = node.firstChild;
        while(node) {
            searchDOM(node, found);
            node = node.nextSibling;
        }
    }

    return true
})();
