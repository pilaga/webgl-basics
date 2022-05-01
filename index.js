main();

function main()
{
    const canvas = document.querySelector('#glcanvas');
    const gl = canvas.getContext('webgl');

    if(!gl) {
        alert('Unable to setup WebGL. Your browser mayb not support it!');
        return;
    }

    var vertices = [
        0.0, 0.0, 0.0,
        0.5, -0.5, 0.0,
        1.0, 1.0, 0.0
    ];

    //create an empty buffer object to store the vertex buffer
    var vertexBuffer = gl.createBuffer();

    //bind appropriate array buffer to it
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    //unbind the buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    //vertex shader
    var vertCode = `
        attribute vec3 coordinates;
        void main(void)
        {
            gl_Position = vec4(coordinates, 1.0);
            gl_PointSize = 10.0;
        }
    `;
    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertCode);
    gl.compileShader(vertShader);

    //fragment shader
    var fragCode = `
        void main(void) 
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 0.1);
        }
    `;
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragCode);
    gl.compileShader(fragShader);

    //create shader program object and attach vertex and fragment shaders
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);

    //link both programs
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    //bind vertex buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    //get the attribute location and point it to currently bound VBO
    var coord = gl.getAttribLocation(shaderProgram, 'coordinates');
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);

    gl.clearColor(1.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.drawArrays(gl.POINTS, 0, 3);
}