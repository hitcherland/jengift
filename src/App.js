import React from 'react';
import './App.css';

class Cloth extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            pinholes: [],
            paths: [],
        }
    
        var dr = 0.03;
        var r = 0.94;
        for(var x=-r; x<=r; x+=dr) {
            var abs_y = Math.sqrt(Math.pow(r, 2) - Math.pow(x, 2));
            for(var y=-abs_y; y<abs_y; y+=dr) {
                var dx = 0.001 * (Math.random() - 0.5);
                var dy = 0.001 * (Math.random() - 0.5);
                this.state.pinholes.push({x: x + dx, y: y + dy});
            }
        }

        for(var i=0; i<3; i++) {
            var path = [];
            for(var j=0; j<30; j++) {
                path.push(Math.floor(Math.floor(Math.random() * this.state.pinholes.length)));
            }
            this.state.paths.push(path);
        }
    }

    componentDidMount() {
        const canvas = this.refs.canvas;
        const ctx = canvas.getContext("2d");

        const midX = this.props.width / 2;
        const midY = this.props.height / 2;
        const radius = Math.min(midX, midY);

        ctx.fillStyle = '#c19a6b';
        ctx.beginPath();
        ctx.arc(midX, midY, radius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#F1F1D4';
        ctx.beginPath();
        ctx.arc(midX, midY, radius * 0.95, 0, 2 * Math.PI);
        ctx.fill();

        for(var pinhole of this.state.pinholes) {
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.beginPath();
            ctx.arc(midX + radius * pinhole.x, midY + radius * pinhole.y, 1, 0, 2 * Math.PI);
            ctx.fill();
        }

        function getRandomColor() {
          var letters = '0123456789ABCDEF';
          var color = '#';
          for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
          }
          return color;
        }

        ctx.lineWidth = 1.5;
        for(var path of this.state.paths) {
            ctx.strokeStyle = getRandomColor();
            ctx.beginPath();
            var begin=true

            for(var pathIndex of path) {
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

    render() {
        var style = { 
            background: this.props.background || "white"
        };
        var canvas = <canvas ref="canvas" width={this.props.width} height={this.props.height} style={style}></canvas>;
        return canvas;
    }
}

function App() {
  return (
    <Cloth width="64" height="64" />
  );
}

export default App;
