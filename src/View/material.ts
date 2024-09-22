export class Material {
    
    texture: GPUTexture
    view: GPUTextureView
    sampler: GPUSampler

    bindGroupLayout : GPUBindGroupLayout;
    bindGroup: GPUBindGroup;


    uniformBufferSingleInt: GPUBuffer;

    depthBufferViewOnlyDepth : GPUTextureView;

    depthTextureSizeBuffer : GPUBuffer;


    async initialize(device: GPUDevice, name: string,isTransparent : number,canvasWith : number,canvasHegiht : number,mipCount : number) {

        this.uniformBufferSingleInt = device.createBuffer({
            size: 16, // Size for a single u32
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        let applyAlpha = new Uint32Array([isTransparent, 0, 0, 0]); 
        device.queue.writeBuffer(this.uniformBufferSingleInt, 0, applyAlpha);

        

        this.depthTextureSizeBuffer = device.createBuffer({
            size: 2 * Float32Array.BYTES_PER_ELEMENT, // vec2<f32> = 2 floats
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        
        // Update the buffer with the size of the depth texture
        device.queue.writeBuffer(this.depthTextureSizeBuffer, 0, new Float32Array([canvasWith, canvasHegiht]));
        

        for (var i = 0; i < mipCount; i += 1) {
            const filename: string = "dist/img/" + name + "/" + name + String(i) + ".png";
            const response: Response = await fetch(filename);
            const blob: Blob = await response.blob();
            const imageData: ImageBitmap = await createImageBitmap(blob);
            
            if(i === 0)
            {
                const textureDescriptor: GPUTextureDescriptor = {
                    size: {
                        width: imageData.width,
                        height: imageData.height
                    },
                    mipLevelCount: mipCount,
                    format: "rgba8unorm",
                    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
                };
        
                this.texture = device.createTexture(textureDescriptor);

                
            }

            await this.loadImageBitmapToGPUDevice(device, imageData, i);
            imageData.close();
        }



        const viewDescriptor: GPUTextureViewDescriptor = {
            format: "rgba8unorm",
            dimension: "2d",
            aspect: "all",
            baseMipLevel: 0,
            mipLevelCount: mipCount,
            baseArrayLayer: 0,
            arrayLayerCount: 1
        };
        this.view = this.texture.createView(viewDescriptor);

        const samplerDescriptor: GPUSamplerDescriptor = {
            addressModeU: "repeat",
            addressModeV: "repeat",
            magFilter: "linear",
            minFilter: "linear",
            mipmapFilter: "linear",
            maxAnisotropy: 4
        };
        this.sampler = device.createSampler(samplerDescriptor);


        this.bindGroupLayout = device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT, // for the png texture loaded from disk
                    texture: {}
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT, // for sampaling the png texture loaded from disk
                    sampler: {}
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {type: 'uniform'} // For the alpha is transparent
                }                
            ]

        });

        this.bindGroup = device.createBindGroup({
            layout: this.bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: this.view
                },
                {
                    binding: 1,
                    resource: this.sampler
                },
                {
                    binding: 2,
                    resource: {
                        buffer: this.uniformBufferSingleInt
                    }
                }
            ]
        });
        
    }


    async loadImageBitmapToGPUDevice(device: GPUDevice, imageData: ImageBitmap, mipLevel: number) {

        device.queue.copyExternalImageToTexture(
            {source: imageData},
            {
                texture: this.texture,
                mipLevel: mipLevel
            },
            {   
                width: imageData.width,
                height: imageData.height
            },
        );
    }

}