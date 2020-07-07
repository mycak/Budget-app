const budgetController = (function(){
    const Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    const Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    Expense.prototype.calcPercentage = function (totalExpense){
        if (totalExpense > 0) {
        this.percentage = Math.round((this.value/totalExpense)*100);
        } else {
            this.percentage = -1;
        }

        return this.percentage;
    }

    const calculateTotal = function(type){
        data.totals[type] = data.allItems[type].reduce((a,b) => {return a + b.value},0);
    };

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage:0
    }

    return {
        addItem: function(type, des, val) {
            let newItem, ID;

            //create new Id
            if (data.allItems[type].length > 0) {
                ID = [data.allItems[type].length-1].id + 1;
            } else {
                ID = 0;
            }

            //create new Item
            if (type === 'exp') {
                newItem = new Expense(ID, des, val)
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val)
            }
            //push it into data structure
            data.allItems[type].push(newItem);
            //return as public new element
            return newItem;
        },
        calculateBudget: function (){
            calculateTotal('inc');
            calculateTotal('exp');
            data.budget = data.totals.inc - data.totals.exp;
            if (data.totals.inc > 0){
            data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
            } else {data.percentage = 0;}
            return data;
        },
        deleteData: function(type, id){
            let ids, index;
            ids = data.allItems[type].map(current => current.id);
            index = ids.indexOf(id);

            if (index !== -1) {
                 data.allItems[type].splice(index, 1);
            }

        },
        calcPercentage: function(){
            data.allItems.exp.forEach(exp => exp.calcPercentage(data.totals.exp));
            return data.allItems.exp.map(item => item.percentage);
        },
        displayData: function (){
            console.log(data);
        }
    }

})();

const UIController = (function(){

    const DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn'
    }

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },
        getListItem: function (obj, type){
            //  create and insert html into dom
            let incList = document.querySelector('.income__list');
            let expList = document.querySelector('.expenses__list');
            
            if (type === 'inc'){
            incList.innerHTML = incList.innerHTML + `
            <div class="item clearfix" id="inc-${obj.id}">
            <div class="item__description">${obj.description}</div>
                <div class="right clearfix">
                    <div class="item__value">+ ${obj.value}</div>
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                </div>
            </div>
            `;
            } else if (type === 'exp'){
            expList.innerHTML = expList.innerHTML + `
            <div class="item clearfix" id="exp-${obj.id}">
            <div class="item__description">${obj.description}</div>
                <div class="right clearfix">
                    <div class="item__value">- ${obj.value}</div>
                    <div class="item__percentage">21%</div>
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                </div>
            </div>
            `;}
        },
        deleteListitem: function (id){
            const itemListToDelete = document.getElementById(id);
            itemListToDelete.remove();
        },
        getDOMStrings: function (){
            return DOMStrings;
        }
    }
})();

const controller = (function(budgetCtrl, UICtrl){

    const setupEventListner = function (){
        const DOM  = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputButton).addEventListener('click', CtrlAddItem
        )
        document.addEventListener('keypress', function(e) {
        if (e.keyCode === 13 || e.which === 13) {
            CtrlAddItem();
        }
        })
        document.querySelector('.container').addEventListener('click', deleteItem);
        document.querySelector('.add__type').addEventListener('change', function () {
            document.querySelector(DOM.inputType).classList.toggle('add__income');
            document.querySelector(DOM.inputValue).classList.toggle('add__income');
            document.querySelector(DOM.inputDescription).classList.toggle('add__income')
        })
    }

    const updateBuget = function (){
        //1. calculate and get budget
        const numbersToDisplay = budgetController.calculateBudget();
        //2. display budget
        function numberWithCommas(x) {
            x = x.toFixed(2);
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        
        const totalToDisplayComas = numberWithCommas(numbersToDisplay.budget);
        updateExpPerc();

        document.querySelector('.budget__value').innerHTML = totalToDisplayComas;
        document.querySelector('.budget__income--value').innerHTML = '+' + ' ' + numberWithCommas(numbersToDisplay.totals.inc);
        document.querySelector('.budget__expenses--value').innerHTML = '-' + ' ' + numberWithCommas(numbersToDisplay.totals.exp);
        document.querySelector('.budget__expenses--percentage').innerHTML = numbersToDisplay.percentage + '%';
        
        function updateExpPerc (){
            const perc = budgetController.calcPercentage();
            const fields = document.querySelectorAll('.item__percentage');

            fields.forEach((field, i) => {
                field.innerHTML = perc[i] + '%';
            });
        };
        
    };

    const CtrlAddItem = function(){
        //1. get the input data
        const input = UICtrl.getInput();
        //2. add the item to budget data
        if (input.description !== "" && !isNaN(input.value)) {
            const newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            
            //3. add the item to the ui
            const newItemUi = UICtrl.getListItem(newItem, input.type);
            //4.calculate and update budget
            updateBuget();
            // Reseting fields
            document.querySelectorAll('input').forEach(input => input.value ='');
            document.querySelectorAll('input')[0].focus();
        } else {-
            alert('Please fill description and value correct !')
        }
    };

    const deleteItem = function (e){

        const itemID = e.target.closest('.item').id;
        const itemParameters = itemID.split('-');
        const type = itemParameters[0];
        const id = parseInt(itemParameters[1]);
        //1. delete data from structure
        budgetController.deleteData(type, id);
        //2. delete data from ui
        UIController.deleteListitem(itemID);
        updateBuget();
        };

    return {
        init: function (){
            setupEventListner();
            updateBuget();
            const d = new Date();
            const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            document.querySelector(".budget__title--month").innerHTML = months[d.getMonth()] + ' ' + d.getFullYear();
        }
    }

})(budgetController, UIController);

controller.init();