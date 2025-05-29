import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { NodeSphere } from './NodeSphere'
import { GraphEngine } from '../../engine/GraphEngine'
import type { Node } from '../types/NodeTypes';
import type { Path } from './graphs/Path';

const graph = new GraphEngine() // Appを通さずに仮インスタンス

export function Graph3D() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 40 }}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls />

      {Object.values(graph.nodes).map((node) => (
        <NodeSphere
          key={node.id}
          position={[node.x, node.y, node.z]}
          label={node.id}
          color={node.CONFIG.autoFire ? 'red' : 'white'}
        />
      ))}
    </Canvas>
  )
}
