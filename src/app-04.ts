//24FI024 大村直
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from 'lil-gui';
import { ParametricGeometry } from "three/addons/geometries/ParametricGeometry.js";
import { createNoise2D} from'simplex-noise';

class ThreeJSContainer {
    private scene!: THREE.Scene;
    private geometry!: THREE.BufferGeometry;
    private material!: THREE.Material;
    private cube!: THREE.Mesh;
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

        this.geometry = new THREE.BoxGeometry(1, 1, 1);
        this.material = new THREE.MeshLambertMaterial({ color: 0x55ff00 });
        this.cube = new THREE.Mesh(this.geometry, this.material);
        this.cube.castShadow = true;

        //this.scene.add(this.cube);

        //ライトの設定
        this.light = new THREE.DirectionalLight(0xffffff);
        const lvec = new THREE.Vector3(1, 1, 1).normalize();
        this.light.position.set(lvec.x, lvec.y, lvec.z);
        this.scene.add(this.light);
    
        // 毎フレームのupdateを呼んで，更新
        // reqestAnimationFrame により次フレームを呼ぶ
        const update: FrameRequestCallback = (_time) => {

            if(guiObj.size === "Wave"){
                waveGroup.visible = true;
                kleinGroup.visible = false;
                perlinGroup.visible = false;
            }

            if(guiObj.size === "Klein"){
                waveGroup.visible = false;
                kleinGroup.visible = true;
                perlinGroup.visible = false;
            }

            if(guiObj.size === "Perlin"){
                waveGroup.visible = false;
                kleinGroup.visible = false;
                perlinGroup.visible = true;
            }
            requestAnimationFrame(update);
        }
        requestAnimationFrame(update);

        const gui = new GUI(); // GUI用のインスタンスの生成
        const guiObj = { size:'Wave'} // GUIのパラメータ
        gui.add(guiObj, "size",['Wave','Klein','Perlin']); //GUIの設定

        const Wave = (u:number,v:number,target:THREE.Vector3) =>{
            const r = 30;
            const x = u*r-r/2;
            const z = v*r-r/2;
            const y = 3*Math.sin(Math.sqrt(x*x+z*z));
            target.set(x,y,z);
        }
        //円
        // const r = 10;
        //     u = u*2*Math.PI;
        //     v = v*Math.PI-Math.PI/2;
        //     const x = r*Math.cos(u)*Math.cos(v);
        //     const y = r*Math.sin(u)*Math.cos(v);
        //     const z = r*Math.sin(v);
        //     target.set(x,y,z);

        const wparamGeometry = new ParametricGeometry(Wave, 30, 30);

        const Klein = (u:number, v:number, target:THREE.Vector3) =>{
            u = u*2*Math.PI;
            v = v*2*Math.PI;
        const r = 4-2*Math.cos(u);
        const z = r*Math.sin(v);
        if(0<=u&&u<Math.PI){
        const x1 = 6*Math.cos(u)*(1+Math.sin(u))+r*Math.cos(u)*Math.cos(v);
        const y1 = Math.sin(u)*16.0+r*Math.sin(u)*Math.cos(v);
        target.set(x1, y1, z);
        }else if(Math.PI<=u&&u<=2*Math.PI){
        const x2 = 6*Math.cos(u)*(1+Math.sin(u))+r*Math.cos(v+Math.PI);
        const y2 = Math.sin(u)*16.0;
        target.set(x2, y2, z);
        }
        }
        const kparamGeometry = new ParametricGeometry(Klein, 30, 30);

        const noise2D = createNoise2D();

        const Perlin = (u:number, v:number, target:THREE.Vector3) =>{
        const r = 30;
        const x = u * r - r/2;
        const z = v * r - r/2;

        const y = 2*noise2D(0.1*x,0.1*z);
        target.set(x, y, z);
}
        const pparamGeometry = new ParametricGeometry(Perlin, 50, 50);

        const paramMaterial = new THREE.MeshPhongMaterial({color:0x00ffff, side:THREE.DoubleSide,flatShading:true});
        const lineMaterial  = new THREE.LineBasicMaterial({color: 0xffffff,transparent:true, opacity:0.5});

        const waveGroup = new THREE.Group();
        const kleinGroup = new THREE.Group();
        const perlinGroup = new THREE.Group();

        waveGroup.add(new THREE.Mesh(wparamGeometry,paramMaterial));
        waveGroup.add(new THREE.LineSegments(wparamGeometry,lineMaterial));
        kleinGroup.add(new THREE.Mesh(kparamGeometry,paramMaterial));
        kleinGroup.add(new THREE.LineSegments(kparamGeometry,lineMaterial));
        perlinGroup.add(new THREE.Mesh(pparamGeometry,paramMaterial));
        perlinGroup.add(new THREE.LineSegments(pparamGeometry,lineMaterial));
        
        this.scene.add(waveGroup);
        this.scene.add(kleinGroup);
        this.scene.add(perlinGroup);

}
    }


window.addEventListener("DOMContentLoaded", init);

function init() {
    const container = new ThreeJSContainer();

    const viewport = container.createRendererDOM(640, 480, new THREE.Vector3(-15, 15, 15));
    document.body.appendChild(viewport);
}
