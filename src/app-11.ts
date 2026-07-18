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

        // メッシュの生成
        const geometry = new THREE.ConeGeometry(0.25, 1);
        const redMaterial = new THREE.MeshPhongMaterial({ color: 0xFF0000 });
        const greenMaterial = new THREE.MeshPhongMaterial({ color: 0x00FF00 });
        const blueMaterial = new THREE.MeshPhongMaterial({ color: 0x0000FF });
        const redCone = new THREE.Mesh(geometry, redMaterial);
        const greenCone = new THREE.Mesh(geometry, greenMaterial);
        const blueCone = new THREE.Mesh(geometry, blueMaterial);

        //モデルの座標移動
        redCone.translateX(0.5);
        redCone.rotateZ(-Math.PI / 2);
        greenCone.translateY(0.5);
        blueCone.translateZ(0.5);
        blueCone.rotateX(Math.PI / 2);

        //グループにして一つのオブジェクトとして扱う
        const obj: THREE.Group = new THREE.Group();
        obj.add(redCone);
        obj.add(greenCone);
        obj.add(blueCone);
        this.scene.add(obj);

        // グリッド表示
        const gridHelper = new THREE.GridHelper(10,);
        this.scene.add(gridHelper);

        // 軸表示
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);

        // 線形補間の関数
        // const lerp = (p0: THREE.Vector3, p1: THREE.Vector3, t: number): (THREE.Vector3) => {
        //     // const result = new THREE.Vector3((1.0 - t) * p0.x + t * p1.x,
        //     //                                     (1.0 - t) * p0.y + t * p1.y,
        //     //                                     (1.0 - t) * p0.z + t * p1.z);
        //     const result = p0.clone().multiplyScalar((1.0 - t)).add(p1.clone().multiplyScalar((t)));
        //     return result;
        // }

        // const bezier = (p0: THREE.Vector3, p1: THREE.Vector3,
        //     p2: THREE.Vector3, p3: THREE.Vector3, t: number): (THREE.Vector3) => {
        //     // const result = new THREE.Vector3((1.0 - t) ** 3 * p0.x + 3 * t * (1.0 - t) ** 2 * p1.x + 3 * t ** 2 * (1.0 - t) * p2.x + t ** 3 * p3.x,
        //     //     (1.0 - t) ** 3 * p0.y + 3 * t * (1 - t) ** 2 * p1.y + 3 * t ** 2 * (1 - t) * p2.y + t ** 3 * p3.y,
        //     //     (1.0 - t) ** 3 * p0.z + 3 * t * (1 - t) ** 2 * p1.z + 3 * t ** 2 * (1 - t) * p2.z + t ** 3 * p3.z);//Bezier曲線を実装する

        //     const result = p0.clone().multiplyScalar((1.0-t)**3.0).add(p1.clone().multiplyScalar((3.0*t*(1.0-t)**2.0)).add(p2.clone().multiplyScalar((3*t**2*(1-t)))).add(p3.clone().multiplyScalar((t**3))));
        //     return result;
        // }

        const hermite = (p0: THREE.Vector3, v0: THREE.Vector3, 
                p1: THREE.Vector3, v1: THREE.Vector3, t: number) : (THREE.Vector3) => {
    // const result = new THREE.Vector3((2*t+1)*(1-t)**2*p0.x+t*(1-t)**2*v0.x+t**2*(3-2t)*p1.x-t**2*(1-t)*v1.x,
    //                                     (2*t+1)*(1-t)**2*p0.y+t*(1-t)**2*v0.y+t**2*(3-2t)*p1.y-t**2*(1-t)*v1.y,
    //                                     (2*t+1)*(1-t)**2*p0.z+t*(1-t)**2*v0.z+t**2*(3-2t)*p1.z-t**2*(1-t)*v1.z);//エルミート曲線を実装する
        const result = p0.clone().multiplyScalar((2*t+1)*(1-t)**2).add(v0.clone().multiplyScalar((t*(1-t)**2)).add(p1.clone().multiplyScalar(t**2*(3-2*t))).add(v1.clone().multiplyScalar(-1*t**2*(1-t))));
    return result;   
}

        //ライトの設定
        this.light = new THREE.DirectionalLight(0xffffff);
        const lvec = new THREE.Vector3(1, 1, 1).normalize();
        this.light.position.set(lvec.x, lvec.y, lvec.z);
        this.scene.add(this.light);

        const timer = new THREE.Timer();
        let t = 0;
        const points: THREE.Vector3[] = []
        // points.push(new THREE.Vector3(-4, 0, 0));
        // points.push(new THREE.Vector3(-3, 0, 3));
        // points.push(new THREE.Vector3(-1, 0, 3));
        // points.push(new THREE.Vector3(0, 0, 0));
        let seg = 0;
        // points.push(new THREE.Vector3(0, 0, 0));
        // points.push(new THREE.Vector3(1, 0, -3));
        // points.push(new THREE.Vector3(4, 0, -4));
        // points.push(new THREE.Vector3(4, 0, -2));
        points.push(new THREE.Vector3(0,0,-4));
        points.push(new THREE.Vector3(0,0,4));
        points.push(new THREE.Vector3(0,0,2));
        points.push(new THREE.Vector3(0,0,8));

        points.push(new THREE.Vector3(0,0,2));
        points.push(new THREE.Vector3(0,0,8));
        points.push(new THREE.Vector3(2,0,2));
        points.push(new THREE.Vector3(0,0,-8));

        points.push(new THREE.Vector3(2,0,2));
        points.push(new THREE.Vector3(0,0,-8));
        points.push(new THREE.Vector3(0,2,0));
        points.push(new THREE.Vector3(-4,0,0));

        points.push(new THREE.Vector3(0,2,0));
        points.push(new THREE.Vector3(-4,0,0));
        points.push(new THREE.Vector3(-4,2,0));
        points.push(new THREE.Vector3(4,0,0));

        const update: FrameRequestCallback = (_time) => {
            timer.update();

            t += timer.getDelta();
            // if (t > 1.0) {
            //     t -= 1.0;
            //     seg = seg+1;
            //     if (points.length/4 == seg) {
            //         seg = 1.0;
            //     }
            // }

            if (t > 1.0) {
                t -= 1.0;
                seg++;
                if (points.length/4 == seg) {
                    seg = 0;
                }
            }



            const pos = hermite(points[seg * 4 + 0], points[seg * 4 + 1], points[seg * 4 + 2], points[seg * 4 + 3], t);
            obj.position.copy(pos);
            requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }
}

window.addEventListener("DOMContentLoaded", init);

function init() {
    const container = new ThreeJSContainer();

    const viewport = container.createRendererDOM(640, 480, new THREE.Vector3(5, 7, 5));
    document.body.appendChild(viewport);
}
