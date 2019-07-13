import React from 'react';
import './App.css';
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) === variable) {
            return decodeURIComponent(pair[1]);
        }
    }
}

class Cloth extends React.Component {
    getPinholes(threadCount) {
        const r = 1;
        var output = [];
        for(var i=0; i<=threadCount; i++) {
            var row = [];
            var x = ( 2 * i / threadCount - 1) * r;
            for(var j=0; j<=threadCount; j++) {
                var y = ( 2 * j / threadCount - 1) * r;
                var dx = 0.002 * (Math.random() - 0.5);
                var dy = 0.002 * (Math.random() - 0.5);
                row.push({x: x + dx, y: y + dy});
            }
            output.push(row);
        }
        return output;
    }

    getPinholeNeighbours(pinholes) {
        var l = pinholes.length; 
        var neighbours = [];
        for(var i=0; i<=l; i++) {
            var neighbour_row = [];
            for(var j=0; j<=l; j++) {
                var neighbour = [];
                if(i > 0) {
                    neighbour.push([i-1, j]);
                    /*if(j + 1 < l)
                        neighbour.push([i-1, j+1]);

                    if(j - 1 > 0)
                        neighbour.push([i-1, j-1]);
                    */
                }

                if(i + 1 < l) {
                    neighbour.push([i+1, j]);
                    /*
                    if(j + 1 < l)
                        neighbour.push([i+1, j+1]);

                    if(j - 1 > 0)
                        neighbour.push([i+1, j-1]);
                    */

                }

                if(j > 0)
                    neighbour.push([i, j-1]);

                if(j + 1 < l)
                    neighbour.push([i, j+1]);
                neighbour_row.push(neighbour)
            }
            neighbours.push(neighbour_row);
        }
        return neighbours;
    }

    regenerate() {
        const threadCount = this.state.threadCount;
        var pinholes = this.getPinholes(threadCount);
        var neighbours = this.getPinholeNeighbours(pinholes);
        this.setState({
            pinholes: pinholes,
            pinholeNeighbours: neighbours
        }, () => {
            this.generatePaths();
        });
    }

    constructor(props) {
        super(props)
        var threadCount = getQueryVariable("threadCount") || this.props.threadCount || 400;
        var pinholes = this.getPinholes(threadCount);
        var neighbours = this.getPinholeNeighbours(pinholes);

        this.state = {
            pinholes: pinholes,
            pinholeNeighbours: neighbours,
            paths: [],
            width: 64,
            height: 64,
            resizeListener: undefined,
            threadCount: threadCount,
            numThreads: getQueryVariable("nthreads") || this.props.nthreads || 5,
            numCurves: getQueryVariable("ncurves") || this.props.ncurves || 5,
            speed: getQueryVariable("speed") || this.props.speed || 64,
            frame: 0,
            then: performance.now()
        }
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.generatePaths();
    }

    getRandomPinhole() {
        var goalX = Math.floor(Math.random() * this.state.pinholes.length);
        var goalY = Math.floor(Math.random() * this.state.pinholes[goalX].length);
        return [goalX, goalY];
    }

    generatePaths() {
        var paths = [];
        for(var thread_index=0; thread_index<this.state.numThreads; thread_index++) {
            var needleIndex = this.getRandomPinhole();
            var path = [needleIndex];
            for(var thread_goal_iter=0; thread_goal_iter<this.state.numCurves; thread_goal_iter++) {
                var goalIndex = this.getRandomPinhole();
                var goalPath = this.getPathBetweenPoints(needleIndex, goalIndex);
                path = path.concat(goalPath);
                needleIndex = goalIndex;
            }
            goalIndex = path[0];
            goalPath = this.getPathBetweenPoints(needleIndex, goalIndex);
            path = path.concat(goalPath);

            paths.push({
                path: path,
                color: this.getRandomColor(),
                show: Math.random()
            });
        }

        this.setState({
            paths: paths
        }, () => this.draw());
    }

    getNextPinhole(i, goal) {
        var min = this.state.pinholeNeighbours[i[0]][i[1]].reduce((o, v) => {
            var ph = this.state.pinholes[v[0]][v[1]];
            var dist_to_goal = Math.sqrt(Math.pow(ph.x - goal.x, 2) + Math.pow(ph.y - goal.y, 2));
            if(dist_to_goal < o[0])
                return [dist_to_goal, v];
            else
                return o;
        }, [100000, undefined]);
        return min[1];
    }

    getPathBetweenPoints(index_a, index_b) {
        var output = [index_a];
        var goal = this.state.pinholes[index_b[0]][index_b[1]];
        var next = index_a;

        while(true) {
            next = this.getNextPinhole(next, goal); 
            if(next[0] === index_b[0] && next[1] === index_b[1])
                break;
            output.push(next);
        }

        output.push(index_b);
        return output;
    }

    getRandomColor() {
      var letters = '0123456789ABCDEF';
      var color = '#';
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }

    resize() {
        var el = this.refs.canvas;
        var par = this.refs.canvas.parentElement;
        var elStyle = window.getComputedStyle(el, null);
        var style = window.getComputedStyle(par, null);
        var height = par.clientHeight;  // height with padding
        var width = par.clientWidth;   // width with padding

        height -= parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
        width -= parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
        height -= parseFloat(elStyle.borderTopWidth) + parseFloat(elStyle.borderBottomWidth);
        width -= parseFloat(elStyle.borderLeftWidth) + parseFloat(elStyle.borderRightWidth);

        var min = Math.min(width, height);
        this.setState({
            width: min,
            height: min, 
        }, () => this.draw())
    }

    draw() {
        const canvas = this.refs.canvas;
        const ctx = canvas.getContext("2d");
        const midX = this.state.width / 2;
        const midY = this.state.height / 2;
        const radius = Math.min(midX, midY);
        const threadCount = this.state.threadCount;

        ctx.fillStyle = '#c19a6b';
        ctx.fillStyle = '#F1F1D4';
        ctx.beginPath();
        ctx.rect(midX - radius, midY - radius, 2 * radius, 2 * radius);
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        for(var i=0; i<this.state.pinholes.length; i++) {
            var row = this.state.pinholes[i];
            for(var pinhole of row) {
                var x = midX + radius * pinhole.x;
                var y = midY + radius * pinhole.y;
                ctx.beginPath();
                ctx.arc(x, y, radius / threadCount, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
        this.renderThreads();
            @property
    }

    renderThreads() {
        const canvas = this.refs.canvas;
        const ctx = canvas.getContext("2d");
        const midX = this.state.width / 2;
        const midY = this.state.height / 2;
        const radius = Math.min(midX, midY);
        const threadCount = this.state.threadCount;
        const frame = this.state.frame;

        ctx.lineWidth = radius * 1.5 / threadCount;
        for(var path of this.state.paths) {
            ctx.strokeStyle = path.color;
            
            ctx.beginPath();
            var begin=true
            var l = path.path.length;
            var L = path.show * l;
            var start = (frame % l);
            var stop = start + L;

            var subpaths = path.path.slice(start, stop);
            if(stop > l) {
                subpaths = subpaths.concat(path.path.slice(0, stop - l))
            }
            for(var pathIndex of subpaths) {
                var point = this.state.pinholes[pathIndex[0]][pathIndex[1]];
                var x = midX + radius * point.x;
                var y = midY + radius * point.y;
                if(begin) {
                    ctx.moveTo(x, y);
                    begin=false;
                } else {
                    ctx.lineTo(x, y);
                    begin=true;
                }
            }
            ctx.stroke();
        }
    }

    componentDidMount() {
        this.setState({
            resizeListener: window.addEventListener("resize", () => this.resize())
        });
        this.generatePaths();
        this.resize();
        this.tick();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.state.resizeListener);
        cancelAnimationFrame(this.animFunc);
    };

    tick() {
        this.animFunc = requestAnimationFrame(() => this.tick());
        var now = performance.now()
        const then = this.state.then;
        const speed = this.state.speed;
        if(now - then > speed) {
            this.setState((state, props) => ({
                frame: state.frame + 1,
                then: now 
            }), this.draw);
        }
    }

    render() {
        var style = {
            border: "12px solid #c19a6b",
            boxSizing:"border-box",
            borderRadius: "12px",
        }
        var canvas = <canvas ref="canvas" onClick={this.handleClick} width={this.state.width} height={this.state.height} style={style}></canvas>;
        return canvas;
    }
}

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            nthreads: 8,
            ncurves: 3,
            threadCount: 50,
            speed: 64,
        }
        this.handleClick = this.handleClick.bind(this);
        this.change_nthreads = this.change_nthreads.bind(this);
        this.change_ncurves = this.change_ncurves.bind(this);
        this.change_threadCount = this.change_threadCount.bind(this);
        this.change_speed = this.change_speed.bind(this);
    }

    handleClick() {
        this.refs.cloth.handleClick();
    }

    change_nthreads(event) {
        var value = event.target.value;
        this.setState({nthreads: value}, () => {
            this.refs.cloth.setState({numThreads: value}, () => {
                this.refs.cloth.generatePaths()
            });
        });
    }

    change_ncurves(event) {
        var value = event.target.value;
        this.setState({ncurves: value}, () => {
            this.refs.cloth.setState({numCurves: value}, () => {
                this.refs.cloth.generatePaths()
            });
        });
    }

    change_threadCount(event) {
        this.setState({threadCount: event.target.value});
        this.refs.cloth.setState({threadCount: event.target.value}, () =>
            this.refs.cloth.regenerate()
        );
    }


    change_speed(event) {
        this.setState({speed: event.target.value});
        this.refs.cloth.setState({speed: event.target.value}, () =>
            this.refs.cloth.regenerate()
        );
    }

    render() {
        return (
            <div className="full">
                <Cloth ref="cloth" nthreads={this.state.nthreads} ncurves={this.state.ncurves} threadCount={this.state.threadCount} speed={this.state.speed}/>
                <div style={{float: "left", top: "1rem"}} className="card position-absolute">
                    <button type="button" className="btn btn-sm btn-primary" data-toggle="collapse" data-target="#options" >options</button>
                        c = t.circumcenter
                    <div className="collapse fade" id="options">
                    <div className="form-group">
                        <label>numerosity</label>
                        <input ref="nthreads" type="range" className="form-control-range" min="1" max="20" value={this.state.nthreads} onChange={this.change_nthreads} />
                    </div>
                    <div className="form-group">
                        <label>travelness</label>
                        <input ref="ncurves" type="range" className="form-control-range" min="2" max="10" value={this.state.ncurves} onChange={this.change_ncurves} />
                    </div>
                    <div className="form-group">
                        <label>luxurity</label>
                        <input ref="threadCount" type="range" className="form-control-range" min="1" max="250" value={this.state.threadCount} onChange={this.change_threadCount} />
                    </div>
                    <div className="form-group">
                        <label>relaxedness</label>
                        <input ref="speed" type="range" className="form-control-range" min="16" max="1000" value={this.state.speed} onChange={this.change_speed} />
                    </div>
 
                    <button onClick={this.handleClick} className="btn btn-primary" type="button">new threads</button>
                </div>
                </div>
            </div>
          );
    }
}

export default App;
