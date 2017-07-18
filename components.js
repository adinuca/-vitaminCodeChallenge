class DataContainer extends React.Component {
    componentWillMount() {
        this._fetchCompanies();
    }

    componentDidMount(){
        this.setState({
            showHistoryTrend: false,
            showFutureTrend: false
        });
    }

    _fetchCompanies() {
        jQuery.ajax({
            method: 'GET',
            url: 'https://www.quandl.com/api/v3/datasets.json?database_code=EOD&rows=4&api_key=yJGXtjqa1y_-2H2szCxC',
            success: (rawCompanies) => {
                let companies = rawCompanies.datasets.map(rawCompany => {
                        return {
                            key: "V",
                            name: rawCompany.name
                        };
                    }
                );
                this.setState({companies});
            }
        });
    }

    constructor() {
        super();
        this.state = {
            companies: [],
            showHistoryTrend: false
        }
    }

    render() {
        let historicalTrend ;
        let futureTrend ;
        if(this.state.showHistoryTrend) {
            let dataSet = this._company.value;
            let startDate = this._startDate.value;
            let endDate = this._endDate.value;
            console.log(dataSet);
            console.log(startDate);
            console.log(endDate);
            historicalTrend =
                <HistoricalTrend company={dataSet} startDate={startDate}
                                 endDate={endDate}/>
        }

        let d = new Date();
        let endDateValue = `${d.getDay()}/${d.getMonth()}/${d.getYear()}`;
        return (
        <div>
            <div className="row">
            <form >
                <div class="form-group">
                    <label for="companiesSelect" className="col-sm-2 control-label">Companies</label>
                    <select id="companiesSelect" className="form-control"  ref={select => this._company = select}>
                        {this.state.companies.map(company =>
                            <option value={company.key}>{company.name}</option>)
                        }
                    </select>
                    <br/>
                </div>

                <div className="form-group">
                    <label for="start-date" className="col-sm-2 control-label">Start date</label>
                    <input type="date"   id="start-date" ref={input => this._startDate = input}/>
                </div>
                <div className="form-group">
                    <label for="end-date" className="col-sm-2 control-label">End date</label>
                    <input type="date"  id="end-date" ref={input => this._endDate = input}/>
                </div>
                <div className="form-group">
                    <a href="#" role="button" className="btn-sm btn btn-default col-sm-2" onClick={this._handleOnClickOnHistoricalTrend.bind(this)}>Show historical trend</a>
                </div>
                <div className="form-group">
                    <a href="#" role="button" className="btn-sm btn btn-default col-sm-offset-1 col-sm-2" onClick={this._handleOnClickOnFutureTrend.bind(this)}>Show future trend</a>
                </div>
            </form>
            </div>
            <div className="row">
                {historicalTrend}
            </div>
        </div>
        )
    }

    _handleOnClickOnHistoricalTrend(event) {
        event.preventDefault();
        console.log("Clicked!");
        this.setState({showFutureTrend:false});
        this.setState({showHistoryTrend:false});
        if (!this._company.value){
            alert("Please select company");
            return
        }
        this.setState({showHistoryTrend:true});
    }

    _handleOnClickOnFutureTrend(event) {
        alert("We are sorry, but this functionality is not supported yet.");
    }
}


class HistoricalTrend extends React.Component {

    _fetchData(dataSet, startDate, endDate) {
        let data = [];
        jQuery.ajax({
            method: 'GET',
            async: false,
            url: `https://www.quandl.com/api/v3/datasets/EOD/${dataSet}.json?api_key=yJGXtjqa1y_-2H2szCxC&start_date=${startDate}&end_date=${endDate}`,
            success: (result) => {
                data =  result.dataset.data;
            }
        });
        return data;
    }

    componentDidMount(){
        console.log("componentDidMount?");
        this._generatePlot();
    }
    componentDidUpdate(){
        console.log("ComponentDidUpdate");
        this._generatePlot()
    }
    render() {
        return <div id="historicalTrend">
        </div>
    }

    _generatePlot() {
        let companyName= this.props.company;
        let startDate = this.props.startDate;
        let endDate=this.props.endDate;

        let historicalData = this._fetchData(companyName, startDate, endDate);
        if(historicalData.length !=0){
            var open = [];
            var high = [];
            var low = [];
            var close = [];
            var x = [];
            historicalData.map(element =>{
                 x.push(new Date(element[0]));
                open.push(element[1]);
                high.push(element[2]);
                low.push(element[3]);
                close.push(element[4]);
                }
            );

            var trace1 = this._createTrace(x,open,"Open", "rgba(100, 200, 102, 0.7)");
            var trace2 = this._createTrace(x,high,"High", "rgba(150, 100, 190, 0.7)");
            var trace3 = this._createTrace(x,low,"Low", "rgba(100, 190, 167, 0.7)");
            var trace4 = this._createTrace(x,close,"Close", "rgba(170, 100, 102, 0.7)");

            var data = [trace1, trace2, trace3, trace4];
            var layout = {
                bargap: 0.05,
                bargroupgap: 0.2,
                barmode: "overlay",
                title: "Historical trend",
                xaxis: {title: "Open"},
                yaxis: {title: "Count"}
            };
            Plotly.newPlot('historicalTrend', data, layout);
        }else{
            alert("The data for the selected company and selected dates is not available or not accessible. " +
                "Please select different search criteria.")
        }
    }

    _createTrace(x, y, name, color) {
        return {
            x: x,
            y: y,

            marker: {
                color: color
            },
            name: name,
            type: "scatter",
            mode: "lines"

        };
    }
}

ReactDOM.render(<DataContainer/>, document.getElementById("main-app"));