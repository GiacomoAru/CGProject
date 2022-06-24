uniformShader = function (gl) {
  var vertexShaderSource = `
    //variabili definite all'esterno
    uniform mat4 uModelMatrix; 
    uniform mat4 uViewMatrix;            
    uniform mat4 uProjectionMatrix;  

    //faro
    uniform mat4 uFaro;
    uniform mat4 uFaroView;

    //shading, se flat non calcola le normali
    uniform highp int shType;
    
    //definiti all'esterno da un object buffer
    attribute vec3 aPosition;           
    attribute vec2 aTexCoords;
    attribute vec3 aNormal;

    //direzione del sole, fissa per ogni frammento
    uniform vec3 uSunDirection;
    varying vec3 vSunDirV;

    //faretti
    uniform vec3 uLArrayPos[12];
    uniform vec3 uLArrayDir[12];

    //direzione di vista da interpolare
    varying vec3 vViewDirect;

    //normale da interpolare
    varying vec3 vNormal;

    //posizione da passare al fragmentShader
    varying vec3 vPosition;
    
    //varying viene interpolata per il fragment
    varying vec2 vTexCoords;

    //faro
    varying vec4 vFaroCoordsP;
    varying vec3 vFaroCoords;
    varying vec3 vFaroNormal;

    mat3 transpose(mat3 matrix) {
      vec3 row0 = matrix[0];
      vec3 row1 = matrix[1];
      vec3 row2 = matrix[2];
      mat3 result = mat3(
          vec3(row0.x, row1.x, row2.x),
          vec3(row0.y, row1.y, row2.y),
          vec3(row0.z, row1.z, row2.z)
      );
      return result;
    }
  
    float det(mat2 matrix) {
        return matrix[0].x * matrix[1].y - matrix[0].y * matrix[1].x;
    }
  
    mat3 inverse(mat3 matrix) {
      vec3 row0 = matrix[0];
      vec3 row1 = matrix[1];
      vec3 row2 = matrix[2];
  
      vec3 minors0 = vec3(
          det(mat2(row1.y, row1.z, row2.y, row2.z)),
          det(mat2(row1.z, row1.x, row2.z, row2.x)),
          det(mat2(row1.x, row1.y, row2.x, row2.y))
      );
      vec3 minors1 = vec3(
          det(mat2(row2.y, row2.z, row0.y, row0.z)),
          det(mat2(row2.z, row2.x, row0.z, row0.x)),
          det(mat2(row2.x, row2.y, row0.x, row0.y))
      );
      vec3 minors2 = vec3(
          det(mat2(row0.y, row0.z, row1.y, row1.z)),
          det(mat2(row0.z, row0.x, row1.z, row1.x)),
          det(mat2(row0.x, row0.y, row1.x, row1.y))
      );
  
      mat3 adj = transpose(mat3(minors0, minors1, minors2));
  
      return (1.0 / dot(row0, minors0)) * adj;
    }
    
    void main(void){

      mat4 ModelViewMatrix = uViewMatrix*uModelMatrix;
      //calcoliamo le coordinate texture per il faro nel vertex, da interpolare
      vFaroCoordsP =  uFaro * uModelMatrix *  vec4(aPosition, 1.0);
      vFaroCoords =  (uFaroView * uModelMatrix *  vec4(aPosition, 1.0)).xyz;
      

      vSunDirV = normalize(uViewMatrix * vec4(uSunDirection,0.0)).xyz;

      //solo traslazioni, rotazioni e scaling, possiamo invertire inversa e trasposta per efficenza e tragliare 
      //la matrice in mat3
      vec3 normalVertex;
      vec3 vFaroNormal;

      if(shType == 0){
        //camera
        normalVertex = normalize(transpose(inverse(mat3(ModelViewMatrix))) * aNormal).xyz;
        //dal punto di vista del faro
        vFaroNormal = normalize(transpose(inverse(mat3(uFaroView * uModelMatrix))) * aNormal).xyz;
      } 
      else{
        normalVertex = vec3(0.0,0.0,0.0);
        vFaroNormal = vec3(0.0,0.0,0.0);
      }
      //calcoliamo il vettore posizione
      vec3 positionVertex = (ModelViewMatrix *	vec4(aPosition, 1.0)).xyz;
      
      vViewDirect = normalize(-positionVertex);
      vNormal = normalVertex;
      vPosition = (ModelViewMatrix * vec4(aPosition, 1.0)).xyz;
      vTexCoords = aTexCoords; 

      gl_Position = uProjectionMatrix * vec4(vPosition, 1.0); 
      //gl_Position = uFaro * uModelMatrix *  vec4(aPosition, 1.0); 
    }                                              
  `;

  
  var fragmentShaderSource = `
  #extension GL_OES_standard_derivatives : enable

    precision highp float;                         
    uniform vec4 uColor;   
    uniform sampler2D uSampler;
    uniform sampler2D uSamplerF; //sampler  faro macchina
    uniform sampler2D uSamplerD; //sampler  profondità

    uniform mat4 uViewMatrix;

    //texture o no
    uniform float textP;

    //tipo di shading
    uniform highp int shType;
    
    //coefficenti phong
    uniform vec3 uKDiffuse;
    uniform vec4 uKSpecular;

    //luce emissima
    uniform vec3 uKEm;

    //faretti
    uniform vec3 uLArrayPos[12];
    uniform vec3 uLArrayDir[12];

    //direzione del sole, fissa per ogni frammento
    varying vec3 vSunDirV;

    //direzione di interpolata
    varying vec3 vViewDirect;

    //normale interpolata
    varying vec3 vNormal; 

    //posizione frammento
    varying vec3 vPosition;

    //varying viene interpolata per il fragment
    varying vec2 vTexCoords;   

    //faro
    varying vec4 vFaroCoordsP;
    varying vec3 vFaroCoords;
    varying vec3 vFaroNormal;

    void main(void){                   
      
      vec3 N;
      vec3 NFaro;
      if(shType == 0){//phong
        N = vNormal;
        NFaro = vFaroNormal;
      }else{//flat
        N = normalize(cross(dFdx(vPosition),dFdy(vPosition)));
        NFaro = normalize(cross(dFdx(vFaroCoords),dFdy(vFaroCoords)));
      }

      //"luce" del faro anteriore
      vec4 faroColor = vec4(0.0,0.0,0.0,0.0);
      float faroDepth = 0.0;

      //calcolo coordinate texture e depth
      vec4 cordT = vFaroCoordsP/(abs(vFaroCoordsP.w)*0.2);
      vec4 cordTNor = vFaroCoordsP/vFaroCoordsP.w;
      //float bias = 0.0007;
      //float bias = clamp(0.005*tan(acos(dot(NFaro,cordT.xyz))),0.01,0.05); 
      float bias = 0.0;
      cordTNor = cordTNor*0.5 + 0.5;
      cordT = cordT*0.5 + 0.5;

      if(cordT.x <= 1.0 && cordT.x >= 0.0 && cordT.y <= 1.0 && cordT.y >= 0.0 && cordT.z > 0.0){
        faroColor = texture2D(uSamplerF,cordT.xy); 

        float faroDepth = texture2D(uSamplerD,cordTNor.xy).x;
        if(faroDepth + bias < cordTNor.z) faroColor.w = 0.0;
        if(dot(NFaro, normalize(-cordT.xyz))  > 0.0) faroColor.w = 0.0;
      }
        

      //texture
      vec4 coloreOgg = texture2D(uSampler,vTexCoords)*textP + uColor*(1.0-textP);

      //coefficente ambiente
      float KAmb = 0.5;
      //coefficente sole
      float KSun = 0.7;

      //luce lampioni
      vec3 ligLamp = vec3(0.8,0.8,0.45);

      //coefficenti luce diffusa
      mat3 KSpecular = mat3(uKSpecular.x, 0.0, 0.0,
                            0.0, uKSpecular.y, 0.0,  
                            0.0, 0.0, uKSpecular.z);
      //coefficenti luce diffusa
      mat3 KDiffuse = mat3(uKDiffuse.x , 0.0, 0.0,
                           0.0, uKDiffuse.y, 0.0, 
                           0.0, 0.0, uKDiffuse.z);

      //componente diffusa
      float cosDiffuse = max(dot(vSunDirV,N),0.0);

      //rimbalzo luce
      vec3 R = normalize(-vSunDirV+2.0 * dot(vSunDirV,N)*N);

      //componente speculare
      float cosSpecular = max(0.000001, pow(dot(vViewDirect,R),uKSpecular.w));

      //componente finale luce sole
      vec3 finale = ((coloreOgg.xyz * KDiffuse) * cosDiffuse
        + (coloreOgg.xyz * KSpecular) * cosSpecular) * KSun;


      //faretti
      //da cambiare, random per ora
      float innerCos = 0.95;
      float outerCos = 0.5;

      //per ogni faretto
      for(int i = 0; i<12; i++){ 
        //calcoliamo la direzione della luce del faretto per vedere se rientra nel cono
        //interno o esterno
        vec3 lampLigVec = vPosition - uLArrayPos[i];
        float alphaCos = dot(normalize(lampLigVec), uLArrayDir[i]);

        //nel cono esterno
        if(alphaCos >= outerCos){

          float fS;
          float c1 = 1.0;
          float c2 = 0.1;
          float length = sqrt(dot(lampLigVec, lampLigVec));
          float attenuation = min(1.0 , 1.0 / c2*length + c1 );

          //nel cono interno
          if(alphaCos >= innerCos){ fS = 1.0;}
          else { fS = pow(alphaCos, 2.0);}

          lampLigVec = normalize(-lampLigVec);

          //componente diffusa
          float cosDiffuseL = max(dot(lampLigVec,N),0.0);

          //rimbalzo luce
          vec3 RL = normalize(-lampLigVec + 2.0 * dot(lampLigVec,N)*N);

          //componente speculare
          float cosSpecularL = max(pow(dot(vViewDirect,RL),uKSpecular.w) , 0.0000001);

          finale = finale + (ligLamp * KDiffuse * cosDiffuseL * fS
            + ligLamp * KSpecular * cosSpecularL * fS ) * attenuation;
        }
      }

      //colore faro
      finale = finale*(1.0 - faroColor.w) + faroColor.xyz*(faroColor.w);

      gl_FragColor = vec4(finale + coloreOgg.xyz * KAmb + uKEm, 1.0);
      //gl_FragColor = vec4(dot(NFaro, vFaroCoordsP.xyz) ,0.0,0.0,1.0);
    }
  `;

  // create the vertex shader
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);

  // create the fragment shader
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);

  // Create the shader program
  var aPositionIndex = 0;
  var aNormalIndex = 1;
  var aTexCoordsIndex = 2;
  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.bindAttribLocation(shaderProgram, aPositionIndex, "aPosition");
  gl.bindAttribLocation(shaderProgram, aNormalIndex, "aNormal");
  gl.bindAttribLocation(shaderProgram, aTexCoordsIndex, "aTexCoords");
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    var str = "Unable to initialize the shader program.\n\n";
    str += "VS:\n" + gl.getShaderInfoLog(vertexShader) + "\n\n";
    str += "FS:\n" + gl.getShaderInfoLog(fragmentShader) + "\n\n";
    str += "PROG:\n" + gl.getProgramInfoLog(shaderProgram);
    alert(str);
  }

  shaderProgram.aPositionIndex = aPositionIndex;
  shaderProgram.aTexCoordsIndex = aTexCoordsIndex;
  shaderProgram.aNormalIndex = aNormalIndex;

  shaderProgram.uModelMatrixLocation = gl.getUniformLocation(shaderProgram, "uModelMatrix");
  shaderProgram.uViewMatrixLocation = gl.getUniformLocation(shaderProgram, "uViewMatrix");
  shaderProgram.uProjectionMatrixLocation = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
  shaderProgram.uFaroLocation = gl.getUniformLocation(shaderProgram, "uFaro");
  shaderProgram.uFaroViewLocation = gl.getUniformLocation(shaderProgram, "uFaroView");
  shaderProgram.uSunDirection = gl.getUniformLocation(shaderProgram, "uSunDirection");
  shaderProgram.uKDiffuseLocation = gl.getUniformLocation(shaderProgram, "uKDiffuse");
  shaderProgram.uKSpecularLocation = gl.getUniformLocation(shaderProgram, "uKSpecular");
  shaderProgram.shType = gl.getUniformLocation(shaderProgram, "shType");
  shaderProgram.textP = gl.getUniformLocation(shaderProgram, "textP");
  shaderProgram.uKEmLocation = gl.getUniformLocation(shaderProgram, "uKEm");
  shaderProgram.uColorLocation = gl.getUniformLocation(shaderProgram, "uColor");
  shaderProgram.uSamplerLocation = gl.getUniformLocation(shaderProgram, "uSampler");
  shaderProgram.uSamplerFLocation = gl.getUniformLocation(shaderProgram, "uSamplerF");
  shaderProgram.uDepthSamplerLocation = gl.getUniformLocation(shaderProgram, "uSamplerD");

  //lamps
  shaderProgram.uLArrayDirLocation = gl.getUniformLocation(shaderProgram, "uLArrayDir");
  shaderProgram.uLArrayPosLocation = gl.getUniformLocation(shaderProgram, "uLArrayPos");
  return shaderProgram;
};