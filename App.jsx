import React from "react";

class App extends React.Component {


    constructor () {
        super();

        this.state = {
            items: [],
            currentItem : {},
            searchTerm : ""
        };

        this.getItems();
    }


    getItems() {
        apiCall("items", {})
            .then((items) => {
                this.setState({items : items});
            });
    }

    setSearch(event) {
        this.setState({searchTerm : event.target.value});
    }

    getCurrentItem(itemName) {
        apiCall("getItem", {"name": itemName}).then(res => {
            this.setState({currentItem : res})
        });
    }

    render () {
        console.log(typeof this.state.items);
        return (
            <div className="container">
                <h1>Rust Items</h1>

                <div className="row">
                    <ItemContainer
                        getCurrentItemCallBack={this.getCurrentItem.bind(this)}
                        items={this.state.items}
                        setSearch={this.setSearch.bind(this)}
                        searchQ={this.state.searchTerm}
                    />
                    <ItemInfoContainer data={this.state.currentItem}/>

                </div>

            </div>
        );

    }
}


class ItemInfoContainer extends React.Component {
    render() {

        return (
            <div className="col-sm-3 used-container">
                <h2>Item Info</h2>
                <label>Name</label>
                <input type="text" className="form-control" onChange={() => {}} value={this.props.data.name || ""}/>
                <br/>
                <label>Type</label>
                <input type="text" className="form-control" onChange={() => {}} value={this.props.data.type || ""}/>
                <br/>
                <label>Desc</label>
                <textarea type="text" className="form-control" onChange={() => {}} value={this.props.data.desc || ""}/>
                <br/>
                <label>Craftable?</label>
                <input type="text" className="form-control" onChange={() => {}} value={"" + this.props.data.craftable}/>
                <br/>
                <label>Craft Resources {this.props.data.craftSeconds? `(${this.props.data.craftSeconds} sec)` : ""}</label>

                {
                   this.props.data.craftable ?
                        <ul>
                            {this.props.data.craftMats.map((m) => <li>{m.qty + "x " + m.name}</li>)}
                        </ul>
                        :
                        <p>N/A</p>
                }
                <hr/>

                {/* TODO: This doesn't actually work yet */}
                QTY: <input className="form-control" value={1} style={{width: 100, display: "inline-block", marginRight: 20}} type="number" />
                <button className="btn btn-primary">Add</button>

            </div>



        );
    }
}
class ItemContainer extends React.Component {
    render() {
        return (
            <div>
                <div className="col-sm-9" style={{paddingLeft: 0, paddingRight: 0, marginBottom: 10}}>

                </div>

                <div className="col-sm-9 item-container">
                    <center>
                        <input onChange={this.props.setSearch} value={this.props.searchQ} style={{width: "80%", display: "block", marginBottom: 10, marginTop: 10}} type="text" placeholder="search" className="form-control" />
                        <hr/>
                    </center>
                    {this.props.items
                        .filter(this.filterItemFunction.bind(this))
                        .map((item,i) => <ItemBox getCurrentItemCallBack={this.props.getCurrentItemCallBack} key={i} data={item}/>)}
                </div>
            </div>
        );
    }
    
    
    filterItemFunction(item) {
        let query = this.props.searchQ;

        let catRegex = query.match(/^category:(.+)/);
        if (catRegex) {
            return item.category.toLowerCase().indexOf(catRegex[1].toLowerCase()) !== -1;
        }

        return query.length === 0 ? true : item.name.toLowerCase().indexOf(query.toLowerCase()) !== -1;



    }
}

class ItemBox extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.data.name !== this.props.data.name;
    }
    render() {
        return (
          <div className="rust-item" onClick={() => {this.props.getCurrentItemCallBack(this.props.data.name)}}>
              <p style={{width: "100%"}}>
                  {this.props.data.name}
              </p>

              {<img style={{width: "auto", height : "auto", float : "center" }}src={this.props.data.img}/>}
          </div>
        );
    }
}


function apiCall(endpoint, params) {

    return new Promise(function (resolve, reject){
        fetch(`http://localhost:8888/${endpoint}${getParamString(params)}`)
            .then(resp => resp.json())
            .then(json => {
                resolve(json);
            });
    });

}

function getParamString(params) {
    return Object.keys(params).length ?
        "?" + Object.keys(params).map((k) => {
            return `${k}=${encodeURIComponent(params[k])}`
        }).join("&")
        :
        "";
}


export default App;