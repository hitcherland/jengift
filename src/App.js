import React from 'react';
import './App.css';

class Cloth extends React.Component {
    getPinholes(threadCount, border) {
        const r = 1 - border * 2;
        const dr = 2 * r / threadCount;
        var output = [];
        for(var x=-r; x<=r; x+=dr) {
            for(var y=-r; y<r; y+=dr) {
                var dx = 0.002 * (Math.random() - 0.5);
                var dy = 0.002 * (Math.random() - 0.5);
                output.push({x: x + dx, y: y + dy});
            }
        }
        return output;
    }

    getPinholeNeighbours(pinholes) {
        var neighbours = {}
        var l = pinholes.length; 
        var L = Math.sqrt(l);
        var x = null;
        for(var i=0; i<l; i++) {
            neighbours[i] = [];
            if(i + 1 % L > i) {
                neighbours[i].push(i + 1);
                if((i + 1 + L) < l )
                    neighbours[i].push(i + L + 1);

                if((i + 1 - L) >= 0 )
                    neighbours[i].push(i - L + 1);
            }

            if((i - 1 + L) % L < i) {
                neighbours[i].push(i - 1);

                if((i - 1 + L) < l )
                    neighbours[i].push(i + L - 1);

                if((i - 1 - L) >= 0 )
                    neighbours[i].push(i - L - 1);
            }

            if(i + L < l)
                neighbours[i].push(i + L);

            if(i - L >= 0)
                neighbours[i].push(i - L);

        }
        return neighbours
    }

    constructor(props) {
        super(props)
        var threadCount = this.props.threadCount || 200;
        var border = this.props.border || 0.02;
        var pinholes = this.getPinholes(threadCount, border);
        var neighbours = this.getPinholeNeighbours(pinholes);

        this.state = {
            pinholes: pinholes,
            pinholeNeighbours: neighbours,
            paths: [],
            width: this.props.width || 64,
            height: this.props.height || 64,
            resizeListener: undefined,
            threadCount: threadCount,
            borderSize: border,
            numThreads: this.props.numThreads || 5,
            numCurves: this.props.numCurves || 5
        }

        var needleIndex = Math.floor(Math.floor(Math.random() * this.state.pinholes.length))
        for(var thread_index=0; thread_index<this.state.numThreads; thread_index++) {
            var path = [needleIndex];
            for(var thread_goal_iter=0; thread_goal_iter<this.state.numCurves; thread_goal_iter++) {
                var goalIndex = Math.floor(Math.random() * this.state.pinholes.length);
                var goalPath = this.getPathBetweenPoints(needleIndex, goalIndex);
                path = path.concat(goalPath);
                needleIndex = goalIndex;
            }
            this.state.paths.push({
                path: path,
                color: this.getRandomColor()
            });
        }
    }

    getNextPinhole(i, goal) {
        var min = this.state.pinholeNeighbours[i].reduce((o, v) => {
            var ph = this.state.pinholes[v];
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
        var goal = this.state.pinholes[index_b];
        var next = index_a;

        while(true) {
            next = this.getNextPinhole(next, goal); 
            if(next === index_b)
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
        var par = this.refs.canvas.parentElement;
        console.log(par.clientWidth, par.clientHeight);
        this.setState({
            width: par.clientWidth,
            height: par.clientHeight
        }, () => this.draw())
    }

    draw() {
        const canvas = this.refs.canvas;
        const ctx = canvas.getContext("2d");
        const midX = this.state.width / 2;
        const midY = this.state.height / 2;
        const radius = Math.min(midX, midY) * 0.9;
        const innerRadius = (1.0 - this.state.borderSize * 2) * radius;

        ctx.fillStyle = '#c19a6b';
        ctx.beginPath();
        ctx.rect(midX - radius, midY - radius, 2 * radius, 2 * radius);
        ctx.fill();

        ctx.fillStyle = '#F1F1D4';
        ctx.beginPath();
        ctx.rect(midX - innerRadius, midY - innerRadius, 2 * innerRadius, 2 * innerRadius);
        ctx.fill();

        for(var i=0; i<this.state.pinholes.length; i++) {
            var pinhole = this.state.pinholes[i];
            ctx.fillStyle = '#FFF';
            var x = midX + radius * pinhole.x;
            var y = midY + radius * pinhole.y;
            ctx.beginPath();
            ctx.arc(x, y, radius / 250, 0, 2 * Math.PI);
            ctx.fill();
        }

        ctx.lineWidth = radius / 150;
        for(var path of this.state.paths) {
            ctx.strokeStyle = path.color;
            
            ctx.beginPath();
            var begin=true

            for(var pathIndex of path.path) {
                var point = this.state.pinholes[pathIndex];
                var x = midX + radius * point.x;
                var y = midY + radius * point.y;
                if(begin) {
                    ctx.moveTo(x, y);
                    begin=false;
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        }
    }

    componentDidMount() {
        this.resize();
        this.setState({
            resizeListener: window.addEventListener("resize", () => this.resize())
        });
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.state.resizeListener);
    };

    render() {
        var canvas = <canvas ref="canvas" width={this.state.width} height={this.state.height}></canvas>;
        return canvas;
    }
}

function App() {
  return (
      <div className="flower">
        <Cloth numThreads="50"/>
      </div>
  );
}

export default App;
