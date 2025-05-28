// src/components/three/NodeSphere.tsx
import { Text } from '@react-three/drei'

interface NodeSphereProps {
  position: [number, number, number]
  radius?: number
  color?: string
  label?: string
}

export function NodeSphere({
  position,
  radius = 0.3,
  color = 'white',
  label = '',
}: NodeSphereProps) {
  return (
    <>
      <mesh position={position}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {label && (
        <Text
          position={[position[0], position[1] + radius + 0.1, position[2]]}
          fontSize={0.2}
          color={color}
        >
          {label}
        </Text>
      )}
    </>
  )
}
