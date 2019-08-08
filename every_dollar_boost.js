const CATEGORY_CLASS = 'Budget-budgetGroup Budget-budgetGroup--expense'
const CATEGORY_NAME_CLASS = 'BudgetGroupHeader-column'
const CATEGORY_FOOTER_CLASS = 'BudgetGroupFooter'
const ITEM_CLASS = 'BudgetItemRow'
const ITEM_NAME_CLASS = 'BudgetItem-label'
const ITEM_PLANNED_CLASS = 'BudgetItemRow-input--amountBudgeted'
const ITEM_SWAPPABLE_CLASS = 'BudgetItemRow-swappableColumn'

var MANIPULATING_DOM = false

class Category {
  static get all () {
    var categoryHTMLS = document.getElementsByClassName(CATEGORY_CLASS)
    var categories = []

    for (var i = 0; i < categoryHTMLS.length; i ++) {
      categories.push(new Category(categoryHTMLS[i]))
    }

    return categories
  }

  constructor (categoryHTML) {
    this.html = categoryHTML
  }

  name () {
    return this.html.getElementsByClassName(CATEGORY_NAME_CLASS)[0].innerText
  }

  items () {
    var itemHTMLS = this.html.getElementsByClassName(ITEM_CLASS)
    var itemCollection = []

    for (var i=0; i < itemHTMLS.length; i++) {
      itemCollection.push(new Item(itemHTMLS[i]))
    }

    return itemCollection
  }

  plannedTotal () {
    var total = 0
    var items = this.items()

    for (var i=0; i < items.length; i++) {
      total += items[i].planned()
    }

    return total
  }

  swappableTotal () {
    var total = 0
    var items = this.items()

    for (var i=0; i < items.length; i++) {
      total += items[i].swappable()
    }

    return total
  }

  injectTotals () {
    if (this.isInjected()) {
      this.updateTotals()
    } else {
      this.createTotals ()
    }
  }

  isInjected () {
    return !!document.getElementById(this.totalsId())
  }

  createTotals () {
    var footer = this.html.getElementsByClassName(CATEGORY_FOOTER_CLASS)[0]

    var totalsDiv = document.createElement('div')
    totalsDiv.id = this.totalsId()
    totalsDiv.style = 'display: flex; width: 100%; justify-content: flex-end;'

    var plannedDiv = document.createElement('div')
    plannedDiv.id = this.plannedTotalId()
    plannedDiv.style = 'display: flex; flex: 0 1 33%; justify-content: end; font-weight: 600;'
    plannedDiv.innerHTML = '$' + this.plannedTotal().toFixed(2)

    var swappableDiv = document.createElement('div')
    swappableDiv.id = this.swappableTotalId()
    swappableDiv.style = 'display: flex; flex: 0 1 33%; justify-content: end; font-weight: 600;'
    swappableDiv.innerHTML = '$' + this.swappableTotal().toFixed(2)

    totalsDiv.appendChild(plannedDiv)
    totalsDiv.appendChild(swappableDiv)
    footer.appendChild(totalsDiv)
  }

  updateTotals () {
    document.getElementById(this.plannedTotalId()).innerHTML = '$' + this.plannedTotal().toFixed(2)
    document.getElementById(this.swappableTotalId()).innerHTML = '$' + this.swappableTotal().toFixed(2)
  }

  totalsId () {
    return this.name().replace(/\s/g, "") + '_totals'
  }

  plannedTotalId () {
    return this.name().replace(/\s/g, "") + '_planned'
  }

  swappableTotalId () {
    return this.name().replace(/\s/g, "") + '_swappable'
  }
}

class Item {
  constructor (itemHTML) {
    this.html = itemHTML
  }

  name () {
    return this.html.getElementsByClassName(ITEM_NAME_CLASS)[0].innerText
  }

  planned () {
    var plannedText = this.html.getElementsByClassName(ITEM_PLANNED_CLASS)[0].value

    return parseFloat(plannedText.replace(/[^0-9.-]/g, ''))
  }

  swappable () {
    var swappableText = this.html.getElementsByClassName(ITEM_SWAPPABLE_CLASS)[0].innerText

    return parseFloat(swappableText.replace(/[^0-9.-]/g, ''))
  }
}

const targetNode = document.getElementById('app-container')
const config = { childList: true, subtree: true }
const callback = (mutationsList, observer) => {
  for(let mutation of mutationsList) {
    if (mutation.type === 'childList') {
      if (MANIPULATING_DOM) { return }

      MANIPULATING_DOM = true
      setTimeout(() => {

        MANIPULATING_DOM = false
        var categories = Category.all

        for (var i=0; i < categories.length; i++) {
          categories[i].injectTotals()
        }
      }, 1000)
    }
  }
}

const observer = new MutationObserver(callback)
observer.observe(targetNode, config)

// function injectDOMElements () {
//   if (MANIPULATING_DOM) { return }

//   MANIPULATING_DOM = true
//   var categories = Category.all

//   for (var i=0; i < categories.length; i++) {
//     categories[i].injectTotals()
//   }
//   setTimeout(() => MANIPULATING_DOM = false, 1000)
// }
