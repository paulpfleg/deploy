function shorten (item)
{
    item.lastModified=item.lastModified.slice(0,-8).replace(/-/g, ".").replace(/T/g, " ");
    var len = item.key.length;
    item.shortkey=item.key;
    if (len>19) {
      item.shortkey="..."+item.key.slice(-19);
    }
    return(item);
}