// type Pattern = {
//   main: string;
//   item: string;
// }

// type FeedProp = {
//   title?: string;
//   link?: string;
//   desc?: string;
// }

// type ItemProp = {
//   title?: string;
//   link?: string;
//   desc?: string;
// }

// type Item = string[];

const RSS_TEMPLATE = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
  <channel>
    <title>%(title)s</title>
    <link>%(link)s</link>
    <description><![CDATA[%(desc)s]]></description>%(items)s
  </channel>
</rss>`

const RSS_ITEM_TEMPLATE = `
    <item>
      <title>%(title)s</title>
      <link>%(link)s</link>
      <description><![CDATA[%(desc)s]]></description>
    </item>`

export class FeedMaker {
  /**
   * Main class for making feeds. Contains methods for setting
   * parameters, input parsing, and feed generation.
   */
  // template: null;
  // source: string;
  // items: Item[];
  // main: string[];
  // patterns: Pattern;
  // feedProp: FeedProp;
  // itemProp: ItemProp

  constructor() {
    this.items = [];
    this.main = [];
    this.source = null;
    this.template = null;
  }

  setPatterns(item, main=null) {
    this.patterns = {item, main}
  }

  setFeedProp(title, link, desc) {
    this.feedProp = {title, link, desc}
  }

  setItemProp(title, link, desc) {
    this.itemProp = {title, link, desc}
  }

  findItems() {
    this.items = this._parse(this.patterns["item"], 0)
  }

  findMain() {
    if(this.patterns["main"]) {
      this.main = this._parse(this.patterns["main"])
    }
  }

  makeFeed() {
    const rssFeed = this._makeMain();
    const items = this._makeItems().join("");
    return rssFeed.replace(`%(items)s`, items)    
  }

  _makeMain() {
    let mainFeed = RSS_TEMPLATE;
    const feedSubs = this.main.length > 0 ? this._setupItem(this.main[0], this.feedProp) : this._feedPropTranform();
    for(let i = 0; i < feedSubs.length; i++) {
      const {key, value} = feedSubs[i];
      mainFeed = mainFeed.replace(key, value)
    }
    return mainFeed;
  }

  _makeItems() {
    const feedItems = [];
    for(let i = 0; i < this.items.length; i++) {
      let feedItemStr = RSS_ITEM_TEMPLATE;
      const nodes = this._makeItem(i);
      for(let j = 0; j < nodes.length; j++) {
        const {key, value} = nodes[j];
        feedItemStr = feedItemStr.replace(key, value);
      }
      feedItems.push(feedItemStr);
    }
    return feedItems;
  }

  _makeItem(id) {
    const item = this.items[id];
    return this._setupItem(item, this.itemProp);
  }

  _setupItem(item, props) {
    const {title, link, desc} = props;
    const titleIndices = this._getIndices(title);
    const linkIndices = this._getIndices(link);
    const descIndices = this._getIndices(desc);
    const result = [];
    
    let itemTitle = title;
    let itemLink = link;
    let itemDesc = desc;

    if(titleIndices) {
      for(let j = 0; j < titleIndices.length; j++) {
        const {key, value} = titleIndices[j];
        const val = item[value-1];
        itemTitle = itemTitle.replace(key, val);
      }
    }

    if(linkIndices) {
      for(let j = 0; j < linkIndices.length; j++) {
        const {key, value} = linkIndices[j];
        const val = item[value-1];
        itemLink = itemLink.replace(key, val);
      }
    }

    if(descIndices) {
      for(let j = 0; j < descIndices.length; j++) {
        const {key, value} = descIndices[j];
        const val = item[value-1];
        itemDesc = itemDesc.replace(key, val);
      }
    }

    if(itemTitle) {
      result.push({key: `%(title)s`, value: itemTitle})
    }

    if(itemLink) {
      result.push({key: `%(link)s`, value: itemLink})
    }
    
    if(itemDesc) {
      result.push({key: `%(desc)s`, value: itemDesc})
    }    

    return result;
  }

  _getIndices(inputStr) {
    if(!inputStr) return;
    const str = inputStr.split(/(\{%\d+\})/);
    const result = [];
    for(let i = 0; i < str.length; i++) {
      const p = str[i].match(/\{%(\d+)\}/);
      if(p && parseInt(p[1]) >= 0) {
        const value = parseInt(p[1]);
        const key = p[0];
        result.push({key, value})
      }
    }
    if(result.length > 0) {
      return result;
    }
  }

  _parse(pattern, maxitems=-1) {
    const pieces = pattern.split(/(\{[*%]\})/);
    let begin = 0;
    let n = this.source.length;
    const items = [];
    let searching = true;
    let iterative = maxitems;
    while(searching) {
      if(begin >= n ) {
        searching = false;
      }
      let keep = false;
      const item = [];
      for(let i = 0; i < pieces.length; i++) {
        const p = pieces[i];        
        if(p === "{*}") {
          keep = false;
        } else if (p === "{%}") {
          keep = true;
        } else {
          const end = this.source.substr(begin).search(p);
          if(end === -1) {
            break;
          }
          if(keep) {
            item.push(this.source.substr(begin, end)?.replace((/[\t\n]/gm),"").trim());
          }
          begin = (begin + end) + p.length;
        }
      }
      iterative += 1;
      if(iterative === 0) {
        searching = false;
      }
      if(item.length === 0) {
        searching = false;
      }
      if(item.length > 0) {
        items.push(item);
      }
    }
    return items;
  }

  _feedPropTranform() {
    const result = [];
    if(this.feedProp.title) {
      result.push({key: `%(title)s`, value: this.feedProp.title})
    }

    if(this.feedProp.link) {
      result.push({key: `%(link)s`, value: this.feedProp.link})
    }
    
    if(this.feedProp.desc) {
      result.push({key: `%(desc)s`, value: this.feedProp.desc})
    }

    return result;
  }
}
