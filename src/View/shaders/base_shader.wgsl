struct TransformData {
    view: mat4x4<f32>,
    projection: mat4x4<f32>,
};

struct ObjectData {
    model: array<mat4x4<f32>>,
};

@binding(0) @group(0) var<uniform> transformUBO: TransformData;
@binding(1) @group(0) var<storage, read> objects: ObjectData;


@binding(0) @group(1) var myTexture: texture_2d<f32>;
@binding(1) @group(1) var mySampler: sampler;
@binding(2) @group(1)  var<uniform> applyAlpha: u32;



@binding(0) @group(2) var previousDepthBuffer: texture_depth_2d;


struct Fragment {
    @builtin(position) Position : vec4<f32>,
    @location(0) TexCoord : vec2<f32>
};

@vertex
fn vs_main(
    @builtin(instance_index) ID: u32,
    @location(0) vertexPostion: vec3<f32>, 
    @location(1) vertexTexCoord: vec2<f32>) -> Fragment {

    var output : Fragment;
    output.Position = transformUBO.projection * transformUBO.view * objects.model[ID] * vec4<f32>(vertexPostion, 1.0);
    output.TexCoord = vertexTexCoord;

    return output;
}

@fragment
fn fs_main(@builtin(position) fragCoord: vec4<f32>,@location(0) TexCoord : vec2<f32>) -> @location(0) vec4<f32> {
   
    var color = textureSample(myTexture, mySampler, TexCoord);
    
    if(applyAlpha == 1u)
    {
        color.a = 0.5; 
    }

    


    // Sample the previous depth value from the depth buffer
    let fragCoordInt = vec2<i32>(i32(fragCoord.xy.x), i32(fragCoord.xy.y));
    let previousDepth = textureLoad(previousDepthBuffer, fragCoordInt, 0);



    if (fragCoord.z <= (previousDepth+0.000001)) 
    {
        discard;
    }
        
    return vec4(color.rgb * color.a,color.a);
}