//24FI024 大村直
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

class ThreeJSContainer {
    private scene!: THREE.Scene;
    private light!: THREE.Light;

    constructor() {

    }

    // 画面部分の作成(表示する枠ごとに)*
    public createRendererDOM = (width: number, height: number, cameraPos: THREE.Vector3) => {
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        renderer.setClearColor(new THREE.Color(0x495ed));
        renderer.shadowMap.enabled = true; //シャドウマップを有効にする

        //カメラの設定
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.copy(cameraPos);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        const orbitControls = new OrbitControls(camera, renderer.domElement);

        this.createScene();
        // 毎フレームのupdateを呼んで，render
        // reqestAnimationFrame により次フレームを呼ぶ
        const render: FrameRequestCallback = (_time) => {
            orbitControls.update();

            renderer.render(this.scene, camera);
            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);

        renderer.domElement.style.cssFloat = "left";
        renderer.domElement.style.margin = "10px";
        return renderer.domElement;
    }

    // シーンの作成(全体で1回)
    private createScene = () => {
        this.scene = new THREE.Scene();
        // 頂点座標の定義
    const addSceneFromObjFile = async (filePath: string) => {

    const meshStr = await readFile(filePath);

    let vertices:number[] = [];
    let vertexIndices:number[] = [];

    let uv:number[] = [];

    let verticesT:number[] = [];
    let uvT:number[] = [];

    let textureFileName = "";

    const meshLines = meshStr.split("\n");

    for(let i = 0; i < meshLines.length; ++i) {
        const meshLine = meshLines[i];
        const meshSpaceSplitArray = meshLine.trim().split(/\s+/);

        const meshType = meshSpaceSplitArray[0];
        if(meshType == "v") {
            vertices.push(parseFloat(meshSpaceSplitArray[1]));
            vertices.push(parseFloat(meshSpaceSplitArray[2]));
            vertices.push(parseFloat(meshSpaceSplitArray[3]));
        }
        else if(meshType == "vt") {
            uv.push(parseFloat(meshSpaceSplitArray[1]));
            uv.push(parseFloat(meshSpaceSplitArray[2]));
        }
        else if(meshType == "mtllib") {
            const mtlStr =await readFile("./src/" + meshSpaceSplitArray[1]);
            const mtlLines = mtlStr.split("\n");

            for(let j = 0; j < mtlLines.length; ++j) {
                const line = mtlLines[j];
                const split = line.trim().split(/\s+/);

                if(split[0] == "map_Kd") {
                    textureFileName = split[1];
                    break;
                }
            }
        }
        else if(meshType == "f") {

            const f1 = meshSpaceSplitArray[1].split("/");
            const f2 = meshSpaceSplitArray[2].split("/");
            const f3 = meshSpaceSplitArray[3].split("/");

            vertexIndices.push(parseInt(f1[0]) - 1);
            vertexIndices.push(parseInt(f2[0]) - 1);
            vertexIndices.push(parseInt(f3[0]) - 1);

            const uvIndex1 = parseInt(f1[1]) - 1;
            const uvIndex2 = parseInt(f2[1]) - 1;
            const uvIndex3 = parseInt(f3[1]) - 1;

            const vIndex1 = parseInt(f1[0]) - 1;
            const vIndex2 = parseInt(f2[0]) - 1;
            const vIndex3 = parseInt(f3[0]) - 1;

            verticesT.push(vertices[vIndex1 * 3],vertices[vIndex1 * 3 + 1],vertices[vIndex1 * 3 + 2]);
            verticesT.push(vertices[vIndex2 * 3],vertices[vIndex2 * 3 + 1],vertices[vIndex2 * 3 + 2]);
            verticesT.push(vertices[vIndex3 * 3],vertices[vIndex3 * 3 + 1],vertices[vIndex3 * 3 + 2]);

            uvT.push(uv[uvIndex1 * 2],uv[uvIndex1 * 2 + 1]);
            uvT.push(uv[uvIndex2 * 2],uv[uvIndex2 * 2 + 1]);
            uvT.push(uv[uvIndex3 * 2],uv[uvIndex3 * 2 + 1]);
        }
    }

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute("position",new THREE.BufferAttribute(new Float32Array(verticesT),3));
    geometry.setAttribute("uv",new THREE.BufferAttribute(new Float32Array(uvT),2));

    geometry.computeVertexNormals();

    const texture =new THREE.TextureLoader().load("./src/" + textureFileName);

    const material =new THREE.MeshBasicMaterial({map: texture});

    const mesh =new THREE.Mesh(geometry,material);

    this.scene.add(mesh);
};

addSceneFromObjFile("./src/dice.obj");

        //ライトの設定
        this.light = new THREE.DirectionalLight(0xffffff);
        const lvec = new THREE.Vector3(1, 1, 1).normalize();
        this.light.position.set(lvec.x, lvec.y, lvec.z);
        this.scene.add(this.light);
    
        // 毎フレームのupdateを呼んで，更新
        // reqestAnimationFrame により次フレームを呼ぶ
        const update: FrameRequestCallback = (_time) => {

            requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }
}

async function readFile(path:string): Promise<string> {
    return new Promise((resolve => {
        const loader = new THREE.FileLoader();
        loader.load(path, (data) => {
                if(typeof data === "string") {
                    resolve(data);
                } else {
                    const decoder = new TextDecoder('utf-8');
                    const decodedString = decoder.decode(data);
                    resolve(decodedString);
                }
            },
        );
    }));
}

window.addEventListener("DOMContentLoaded", init);

function init() {
    const container = new ThreeJSContainer();

    const viewport = container.createRendererDOM(640, 480, new THREE.Vector3(0, 0, 3));
    document.body.appendChild(viewport);
}
