class BinarySortTree {
  constructor(value, left, right) {
    this.value = value;
    this.left = left;
    this.right = right;
  }
  inOrder(arr) {
    if (this.left) this.left.inOrder(arr)
    arr.push(this.value)
    if (this.right) this.right.inOrder(arr)
  }
  followPath(path, index=0) {
    if (!path || index >= path.length) return this
    else if (path[index]) return this.right.followPath(path, index+1)
    else return this.left.followPath(path, index+1)
  }
  toString(top='', there='', bottom='') {
    let s = ''
    if (this.left) {
      s += this.left.toString(top + '    ', top + ' ┌─ ', top + ' │  ')
    }
    s += there + this.value + '\n'
    if (this.right) {
      s += this.right.toString(bottom + ' │  ', bottom + ' └─ ', bottom + '    ')
    }
    return s
  }
}

function buildTemplateString(t) {
  let s = t[0][0]
  for (let i = 1; i < t.length; i++) s += t[i] + t[0][i]
  return s
}

function escapeHTML() {
  return buildTemplateString(arguments)
}

Vue.component('view-main', {
  props: {
    list: Array
  },
  data() {return {
    newEntry: ''
  }},
  methods: {
    addEntry() {
      if (this.newEntry && this.list.indexOf(this.newEntry) < 0) {
        this.list.push(this.newEntry)
      }
      this.newEntry = ''
      this.$refs.entryInput.focus()
    },
    shuffle() {
      for (let i = this.list.length - 1; i >= 0; i--) {
        let r = Math.floor(Math.random() * (i + 1))
        let t = this.list[i];
        this.list[i] = this.list[r];
        this.list[r] = t;
      }
      this.list.reverse()
    }
  },
  template: escapeHTML`
  <div class="View main">
    <div id="add" class="InputGroup">
      <input ref="entryInput" v-model="newEntry" type="text" @keypress.enter="addEntry()">
      <button @click="addEntry()" :disabled="!newEntry">add</button>
    </div>
    <ul id="list" class="SimpleList" is="transition-group" name="transition-list">
      <li v-for="entry, index in list" :key="entry" @click="list.splice(index, 1)">{{entry}}</li>
      <li v-if="list.length == 0" :key="0" class="empty">empty</li>
    </ul>
    <div id="actions" class="ButtonGroup">
      <button @click="$emit('update:view', 'view-decide')" :disabled="list.length < 2">sort'em</button>
      <button @click="shuffle()">shuffle</button>
      <button @click="list.splice(0, list.length)">clear</button>
    </div>
  </div>`
})

Vue.component('view-decide', {
  props: {
    list: Array
  },
  data() {return {
    a: null,
    b: null,
    index: 1,
    path: [],
    tree: new BinarySortTree(this.list[0]),
    table: {}
  }},
  methods: {
    selectDecision(v) {
      let stree = this.tree.followPath(this.path)
      if (v) {
        if (stree.right == null) {
          stree.right = new BinarySortTree(this.a)
          this.path.splice(0, this.path.length)
          this.index++
        } else {
          this.path.push(true)
        }
      } else {
        if (stree.left == null) {
          stree.left = new BinarySortTree(this.a)
          this.path.splice(0, this.path.length)
          this.index++
        } else {
          this.path.push(false)
        }
      }
      console.log(this.tree.toString())
      if (this.index < this.list.length) {
        this.setupDecision()
      } else {
        this.list.splice(0, this.list.length)
        this.tree.inOrder(this.list)
        this.$emit('update:view', 'view-result')
      }
    },
    setupDecision() {
      this.a = this.list[this.index]
      this.b = this.tree.followPath(this.path).value
    }
  },
  created() {
    this.setupDecision()
  },
  template: escapeHTML`
  <div class="View decide">
    <div id="decide-a" class="decide" @click="selectDecision(false)"><transition name="transition-slide"><div :key="a">{{a}}</div></transition></div>
    <div class="or">or</div>
    <div id="decide-b" class="decide" @click="selectDecision(true)"><transition name="transition-slide"><div :key="b">{{b}}</div></transition></div>
  </div>`
})

Vue.component('view-result', {
  props: {
    list: Array
  },
  template: escapeHTML`
  <div class="View result">
    <ul id="list" class="SimpleList"><li v-for="entry in list">{{entry}}</li></ul>
    <div id="actions" class="ButtonGroup">
      <button @click="$emit('update:view', 'view-main')">again</button>
    </div>
  </div>`
})

new Vue({
  el: 'main',
  data: {
    view: 'view-main',
    list: ['click/tap', 'any', 'entry', 'to', 'remove', 'it']
  },
  template: escapeHTML`
  <transition name="transition-page"><div :is="view" :view.sync="view" :list.sync="list"></div></transition>`
})
