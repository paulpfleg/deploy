
// function to format the content of the file cards
function shorten (item)
{
    // cuts of last chars of last modified
    //replaces cahrs for cleaner format
    item.lastModified=item.lastModified.slice(0,-7).replace(/-/g, ".").replace(/T/g, " ");
    var len = item.key.length;
    //shortens long titles
    item.shortkey=item.key;
    if (len>19) {
      item.shortkey="..."+item.key.slice(-19);
    }
    return(item);
}

  //lists the content of the S3 Bucket and render cards'
  // if the bucket isn't reachable an errorcard is rendered
  function listAll(data,action,id){

    data = JSON.parse(data);
    list = data;
    const objectList = data.map((item, index) => {
      item=shorten(item);

      if (item.key==="Error"){  
          return `
          <div class="card mb-3" title="S3 Error">
          <div class="card-header allert">
                          <b class="card-title">S3 Error</b> 
                      </div>
                      <div class="card-body" >
                          when loading files 
                          <br>
                          <br>
                          please check credentials
                      </div>
          </div>
          
          </div>`
      
      
      }
      else {
        item=shorten(item);
        return `
        <div class="card mb-3" onclick="${action}(${index})" data-bs-toggle="tooltip" data-placement="left" data-html="true" title=${item.key}>
            <div class="card-header">
                        <b class="card-title">${item.shortkey}</b> 
                    </div>
                    <div class="card-body">
                        Size: ${item.size} 
                        <br>
                        Modified: ${item.lastModified}
                    </div>
        </div>                                     
        `}
    });
    document.getElementById(id).innerHTML = objectList.join(" ");
  }

  // sends an xhr request to to URL 
  // request type is specified via type
  function getData(url, type , cb) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = state => {
        if(xhr.readyState === XMLHttpRequest.DONE) {
            cb(xhr.responseText);
        }
    }
    xhr.timeout = 10000;
    xhr.open(type , url);
    xhr.send();
}