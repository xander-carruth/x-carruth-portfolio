/**
 * Last modified by @author Mr&Mrs(2014)
 * Based  on work by alteredq / http://alteredqualia.com/
 * and derivative of Nvidia Cg tutorial
 */

const FresnelShader = {
   uniforms: {
      mRefractionRatio: { type: 'f', value: 0.988 },
      mFresnelBias: { type: 'f', value: 0.9 },
      mFresnelPower: { type: 'f', value: 2.0 },
      mFresnelScale: { type: 'f', value: 1.0 },
      tCube: { type: 't', value: null },
      amplitude: { type: 'f', value: 0.0 },
      explode: { type: 'f', value: 0.0 },
      opacity: { type: 'f', value: 1.0 },
   },

   vertexShader: [
      'uniform float mRefractionRatio;',
      'uniform float mFresnelBias;',
      'uniform float mFresnelScale;',
      'uniform float mFresnelPower;',

      'varying vec3  vReflect;',
      'varying vec3  vRefract[3];',
      'varying float vReflectionFactor;',

      'uniform float amplitude;',
      'attribute vec3 vel;',

      'attribute float lifespan;',
      'varying float vLifespan;',

      'void main() {',
      'vLifespan = lifespan;',

      'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
      'vec4 worldPosition	= modelMatrix*1.3 * vec4( position, 1.0 );',

      'vec3 worldNormal	= normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );',

      'vec3 I		= worldPosition.xyz - cameraPosition;',

      'vReflect	= reflect( I, worldNormal );',
      'vRefract[0]	= refract( normalize( I ), worldNormal, mRefractionRatio * 0.986 );',
      'vRefract[1]	= refract( normalize( I ), worldNormal, mRefractionRatio * 0.987 );',
      'vRefract[2]	= refract( normalize( I ), worldNormal, mRefractionRatio * 0.988 );',
      'vReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), mFresnelPower);',

      'if (!(lifespan <= 0.0)) {',
      'vec3 newPosition = position + worldNormal * vel * amplitude;',
      'gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0 );',
      '}',
      '}',
   ].join('\n'),

   fragmentShader: [
      'uniform float opacity;',

      'uniform samplerCube tCube;',

      'varying vec3 vReflect;',
      'varying vec3 vRefract[3];',
      'varying float vReflectionFactor;',

      'varying float vLifespan;',
      'void main() {',
      'if (vLifespan <= 0.0) {',
      'discard;',
      '} else {',
      'vec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, -vReflect.yz ) );',
      'vec4 refractedColor = vec4( 0.90 );',

      'refractedColor.r = textureCube( tCube, vec3( vRefract[0].x, vRefract[0].yz ) ).r;',
      'refractedColor.g = textureCube( tCube, vec3( vRefract[1].x, vRefract[1].yz ) ).g;',
      'refractedColor.b = textureCube( tCube, vec3( vRefract[2].x, vRefract[2].yz ) ).b;',

      'gl_FragColor = mix( refractedColor*0.94, reflectedColor, clamp( vReflectionFactor, 0.5, 0.15 ) );',
      'gl_FragColor *= opacity;',
      '}',
      '}',
   ].join('\n'),
};

export default FresnelShader;
