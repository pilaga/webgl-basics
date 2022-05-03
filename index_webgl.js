main();

function NormalisedToDevice(coord, axisSize) {
    var halfAxisSize = axisSize / 2.0;
    var deviceCoord = (coord + 1) * halfAxisSize;
    return deviceCoord;
}

function DeviceToNormalised(coord, axisSize) {
    var halfAxisSize = axisSize / 2.0;
    var normalisedCoord = (coord / halfAxisSize) - 1;
    return normalisedCoord;
}

function main()
{
    const canvas = document.querySelector('#glcanvas');
    const gl = canvas.getContext('webgl');

    if(!gl) {
        alert('Unable to setup WebGL. Your browser mayb not support it!');
        return;
    }

    //cube vertices
    var vertices = [
    	-1,-1,-1, 1,-1,-1, 1,1,-1, -1,1,-1,
    	-1,-1,1, 1,-1,1, 1,1,1, -1,1, 1,
    	-1,-1,-1, -1,1,-1, -1,1,1, -1,-1,1,
    	1,-1,-1, 1,1,-1, 1,1,1, 1,-1,1,
    	-1,-1,-1, -1,-1,1, 1,-1,1, 1,-1,-1,
    	-1,1,-1, -1,1,1, 1,1,1, 1,1,-1, 
    ];
    
    var colors = [
    	5,3,7, 5,3,7, 5,3,7, 5,3,7,
    	1,1,3, 1,1,3, 1,1,3, 1,1,3,
    	0,0,1, 0,0,1, 0,0,1, 0,0,1,
    	1,0,0, 1,0,0, 1,0,0, 1,0,0,
    	1,1,0, 1,1,0, 1,1,0, 1,1,0,
    	0,1,0, 0,1,0, 0,1,0, 0,1,0
    ];

    //cube indices
    var indices = [
    	0,1,2, 0,2,3, 4,5,6, 4,6,7,
    	8,9,10, 8,10,11, 12,13,14, 12,14,15,
    	16,17,18, 16,18,19, 20,21,22, 20,22,23 
    ];

    //create an empty buffer object to store the vertex buffer
    var vertexBuffer = gl.createBuffer();

    //bind appropriate array buffer to it
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    //unbind the buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    //create color buffer
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    

    //create empty buffer object to store index buffer
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    //unbind the buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    //vertex shader
    var vertCode = `
        attribute vec3 position;
        uniform mat4 p_matrix;
        uniform mat4 v_matrix;
        uniform mat4 m_matrix;
        attribute vec3 color;
        varying vec3 vcolor;

        void main(void)
        {
            gl_Position = p_matrix * v_matrix * m_matrix * vec4(position, 1.0);
            vcolor = color;
        }
    `;
    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertCode);
    gl.compileShader(vertShader);

    //fragment shader
    var fragCode = `
        precision mediump float;
        varying vec3 vcolor;

        void main(void) 
        {
            gl_FragColor = vec4(vcolor, 1.0);
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

    var p_matrix = gl.getUniformLocation(shaderProgram, "p_matrix");
    var v_matrix = gl.getUniformLocation(shaderProgram, "v_matrix");
    var m_matrix = gl.getUniformLocation(shaderProgram, "m_matrix");

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    var position = gl.getAttribLocation(shaderProgram, "position");
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(position);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    var color = gl.getAttribLocation(shaderProgram, "color");
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(color);

   gl.useProgram(shaderProgram);


    /*==================== MATRIX =====================*/
    function get_projection( angle, a, zMin, zMax )
    {
       var ang = Math.tan( ( angle * 0.5 ) * Math.PI / 180 );
       
       return [
          0.5 / ang, 0 , 0, 0,
          0, 0.5 * a / ang, 0, 0,
          0, 0, - ( zMax + zMin ) / ( zMax - zMin ), -1,
          0, 0, ( -2 * zMax * zMin ) / ( zMax - zMin ), 0 
       ];
    }

    var proj_matrix = get_projection( 40, canvas.width / canvas.height, 1, 100) ;

    var mov_matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
    var view_matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];

    // Translating z
    view_matrix[14] = view_matrix[14] - 6;

    /*==================== Rotation ====================*/
    function rotateX( m, angle )
    {
    	var c = Math.cos( angle );
    	var s = Math.sin( angle );
    	var mv1 = m[1], mv5 = m[5], mv9 = m[9];

    	m[1] = m[1] * c - m[2] * s;
    	m[5] = m[5] * c - m[6] * s;
    	m[9] = m[9] * c - m[10] * s;

    	m[2] = m[2] * c + mv1 * s;
    	m[6] = m[6] * c + mv5 * s;
    	m[10] = m[10] * c + mv9 * s;
    }

    function rotateY( m, angle )
    {
    	var c = Math.cos( angle );
    	var s = Math.sin( angle );
    	var mv0 = m[0], mv4 = m[4], mv8 = m[8];

    	m[0] = c * m[0] + s * m[2];
    	m[4] = c * m[4] + s * m[6];
    	m[8] = c * m[8] + s * m[10];

    	m[2] = c * m[2] - s * mv0;
    	m[6] = c * m[6] - s * mv4;
    	m[10] = c * m[10] - s * mv8;
    }

    function rotateZ( m, angle )
    {
    	var c = Math.cos( angle );
    	var s = Math.sin( angle );
    	var mv0 = m[0], mv4 = m[4], mv8 = m[8];

    	m[0] = c * m[0] - s * m[1];
    	m[4] = c * m[4] - s * m[5];
    	m[8] = c * m[8] - s * m[9];

    	m[1]=c * m[1] + s * mv0;
    	m[5]=c * m[5] + s * mv4;
    	m[9]=c * m[9] + s * mv8;
    }

    var previous_time = 0;

    var animate = function(time) {
        var dt = time - previous_time;
        rotateZ(mov_matrix, dt * 0.001);
        rotateY(mov_matrix, dt * 0.0001);
        rotateX(mov_matrix, dt * 0.002);
        previous_time = time;

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clearColor(0.5, 0.5, 0.5, 0.9);
        gl.clearDepth(1.0);

        gl.viewport(0.0, 0.0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.uniformMatrix4fv(p_matrix, false, proj_matrix);
        gl.uniformMatrix4fv(v_matrix, false, view_matrix);
        gl.uniformMatrix4fv(m_matrix, false, mov_matrix);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

        window.requestAnimationFrame(animate);
    };

    animate(0);
}