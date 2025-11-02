// import React, { useState, useEffect, useRef } from 'react';

// const PeopleSimulation = () => {
//   const [people, setPeople] = useState([]);
//   const [nextId, setNextId] = useState(1);
//   const [maxPeople, setMaxPeople] = useState(20);
//   const [interval, setInterval] = useState(15);
//   const canvasRef = useRef(null);
//   const animationRef = useRef(null);
//   const peopleRef = useRef([]);

//   const BOX_WIDTH = 700;
//   const BOX_HEIGHT = 500;
//   const ENTRY_X = BOX_WIDTH - 10;
//   const ENTRY_Y = BOX_HEIGHT / 2 - 80;
//   const EXIT_X = BOX_WIDTH - 10;
//   const EXIT_Y = BOX_HEIGHT / 2 + 20;
//   const DOOR_WIDTH = 10;
//   const DOOR_HEIGHT = 60;

//   // Initialize with some people
//   useEffect(() => {
//     const initialPeople = Array.from({ length: 5 }, (_, i) => ({
//       id: i + 1,
//       x: Math.random() * (BOX_WIDTH - 100) + 50,
//       y: Math.random() * (BOX_HEIGHT - 100) + 50,
//       vx: 0,
//       vy: 0,
//       targetX: Math.random() * (BOX_WIDTH - 100) + 50,
//       targetY: Math.random() * (BOX_HEIGHT - 100) + 50,
//       speed: 1 + Math.random() * 1.5,
//       color: `hsl(${Math.random() * 360}, 70%, 60%)`,
//       leaving: false,
//       legPhase: Math.random() * Math.PI * 2
//     }));
//     setPeople(initialPeople);
//     peopleRef.current = initialPeople;
//     setNextId(6);
//   }, []);

//   // Entry/Exit event based on interval
//   useEffect(() => {
//     const scheduleNextEvent = () => {
//       setTimeout(() => {
//         setPeople(prev => {
//           let updated = [...prev];
          
//           // Try to add new person if under max
//           if (updated.length < maxPeople) {
//             const newPerson = {
//               id: nextId,
//               x: ENTRY_X - 30,
//               y: ENTRY_Y + DOOR_HEIGHT / 2,
//               vx: 0,
//               vy: 0,
//               targetX: Math.random() * (BOX_WIDTH - 150) + 50,
//               targetY: Math.random() * (BOX_HEIGHT - 100) + 50,
//               speed: 1 + Math.random() * 1.5,
//               color: `hsl(${Math.random() * 360}, 70%, 60%)`,
//               leaving: false,
//               legPhase: 0
//             };
//             updated.push(newPerson);
//             setNextId(n => n + 1);
//           }

//           // Try to remove random person if there are people
//           if (updated.length > 0 && Math.random() > 0.3) {
//             const leaveIndex = Math.floor(Math.random() * updated.length);
//             updated[leaveIndex] = { ...updated[leaveIndex], leaving: true };
//           }

//           return updated;
//         });

//         scheduleNextEvent();
//       }, interval * 1000);
//     };

//     scheduleNextEvent();
//   }, [interval, maxPeople, nextId]);

//   // Draw person function
//   const drawPerson = (ctx, x, y, color, legPhase, isMoving) => {
//     const bodyHeight = 20;
//     const bodyWidth = 12;
//     const headRadius = 6;
    
//     // Head
//     ctx.beginPath();
//     ctx.arc(x, y - bodyHeight / 2 - headRadius, headRadius, 0, Math.PI * 2);
//     ctx.fillStyle = '#ffd1a3';
//     ctx.fill();
//     ctx.strokeStyle = '#333';
//     ctx.lineWidth = 1.5;
//     ctx.stroke();

//     // Body
//     ctx.beginPath();
//     ctx.fillStyle = color;
//     ctx.fillRect(x - bodyWidth / 2, y - bodyHeight / 2, bodyWidth, bodyHeight);
//     ctx.strokeStyle = '#333';
//     ctx.lineWidth = 1.5;
//     ctx.strokeRect(x - bodyWidth / 2, y - bodyHeight / 2, bodyWidth, bodyHeight);

//     // Arms
//     ctx.beginPath();
//     ctx.moveTo(x - bodyWidth / 2, y - bodyHeight / 2 + 5);
//     ctx.lineTo(x - bodyWidth / 2 - 6, y - bodyHeight / 2 + 12);
//     ctx.moveTo(x + bodyWidth / 2, y - bodyHeight / 2 + 5);
//     ctx.lineTo(x + bodyWidth / 2 + 6, y - bodyHeight / 2 + 12);
//     ctx.strokeStyle = '#333';
//     ctx.lineWidth = 2;
//     ctx.stroke();

//     // Legs with walking animation
//     if (isMoving) {
//       const legSwing = Math.sin(legPhase) * 8;
      
//       // Left leg
//       ctx.beginPath();
//       ctx.moveTo(x - bodyWidth / 4, y + bodyHeight / 2);
//       ctx.lineTo(x - bodyWidth / 4 + legSwing, y + bodyHeight / 2 + 12);
//       ctx.strokeStyle = '#555';
//       ctx.lineWidth = 2.5;
//       ctx.stroke();

//       // Right leg
//       ctx.beginPath();
//       ctx.moveTo(x + bodyWidth / 4, y + bodyHeight / 2);
//       ctx.lineTo(x + bodyWidth / 4 - legSwing, y + bodyHeight / 2 + 12);
//       ctx.stroke();
//     } else {
//       // Standing still
//       ctx.beginPath();
//       ctx.moveTo(x - bodyWidth / 4, y + bodyHeight / 2);
//       ctx.lineTo(x - bodyWidth / 4, y + bodyHeight / 2 + 12);
//       ctx.moveTo(x + bodyWidth / 4, y + bodyHeight / 2);
//       ctx.lineTo(x + bodyWidth / 4, y + bodyHeight / 2 + 12);
//       ctx.strokeStyle = '#555';
//       ctx.lineWidth = 2.5;
//       ctx.stroke();
//     }
//   };

//   // Animation loop
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext('2d');

//     const animate = () => {
//       // Clear canvas
//       ctx.clearRect(0, 0, BOX_WIDTH, BOX_HEIGHT);

//       // Draw box
//       ctx.strokeStyle = '#333';
//       ctx.lineWidth = 3;
//       ctx.strokeRect(0, 0, BOX_WIDTH, BOX_HEIGHT);

//       // Draw entry door
//       ctx.fillStyle = '#4ade80';
//       ctx.fillRect(ENTRY_X, ENTRY_Y, DOOR_WIDTH, DOOR_HEIGHT);
//       ctx.fillStyle = '#333';
//       ctx.font = 'bold 14px Arial';
//       ctx.fillText('ENTRY', ENTRY_X - 50, ENTRY_Y + DOOR_HEIGHT / 2 + 5);

//       // Draw exit door
//       ctx.fillStyle = '#ef4444';
//       ctx.fillRect(EXIT_X, EXIT_Y, DOOR_WIDTH, DOOR_HEIGHT);
//       ctx.fillStyle = '#333';
//       ctx.fillText('EXIT', EXIT_X - 45, EXIT_Y + DOOR_HEIGHT / 2 + 5);

//       // Update and draw people
//       peopleRef.current = peopleRef.current.map(person => {
//         let { x, y, vx, vy, targetX, targetY, speed, leaving, legPhase } = person;

//         if (leaving) {
//           // Move towards exit door
//           const dx = EXIT_X - x;
//           const dy = (EXIT_Y + DOOR_HEIGHT / 2) - y;
//           const dist = Math.sqrt(dx * dx + dy * dy);
          
//           if (dist < 5) {
//             return null; // Remove person
//           }
          
//           vx = (dx / dist) * speed * 2;
//           vy = (dy / dist) * speed * 2;
//           x += vx;
//           y += vy;
//           legPhase += 0.3;
//         } else {
//           // Move towards target
//           const dx = targetX - x;
//           const dy = targetY - y;
//           const dist = Math.sqrt(dx * dx + dy * dy);
          
//           if (dist < 10) {
//             // Reached target, set new target
//             targetX = Math.random() * (BOX_WIDTH - 150) + 50;
//             targetY = Math.random() * (BOX_HEIGHT - 100) + 50;
//           }
          
//           vx = (dx / dist) * speed;
//           vy = (dy / dist) * speed;
//           x += vx;
//           y += vy;
//           legPhase += 0.2;
//         }

//         const isMoving = Math.abs(vx) > 0.1 || Math.abs(vy) > 0.1;
//         drawPerson(ctx, x, y, person.color, legPhase, isMoving);

//         return { ...person, x, y, vx, vy, targetX, targetY, legPhase };
//       }).filter(Boolean);

//       setPeople([...peopleRef.current]);
//       animationRef.current = requestAnimationFrame(animate);
//     };

//     animate();

//     return () => {
//       if (animationRef.current) {
//         cancelAnimationFrame(animationRef.current);
//       }
//     };
//   }, []);

//   // Sync people state with ref
//   useEffect(() => {
//     peopleRef.current = people;
//   }, [people]);

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
//       <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl">
//         <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
//           People Wandering Simulation
//         </h1>
        
//         <div className="grid grid-cols-2 gap-4 mb-6">
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Max People in Room
//             </label>
//             <input
//               type="number"
//               min="1"
//               max="50"
//               value={maxPeople}
//               onChange={(e) => setMaxPeople(Number(e.target.value))}
//               className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//             />
//           </div>
          
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Interval (seconds)
//             </label>
//             <input
//               type="number"
//               min="1"
//               max="60"
//               value={interval}
//               onChange={(e) => setInterval(Number(e.target.value))}
//               className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
//             />
//           </div>
//         </div>

//         <div className="mb-4 text-center bg-blue-50 rounded-lg p-3">
//           <p className="text-lg text-gray-700">
//             People inside: <span className="font-bold text-blue-600 text-xl">{people.length}</span> / {maxPeople}
//           </p>
//         </div>
        
//         <canvas
//           ref={canvasRef}
//           width={BOX_WIDTH}
//           height={BOX_HEIGHT}
//           className="border-4 border-gray-300 rounded-lg shadow-inner bg-gray-50"
//         />
        
//         <div className="mt-4 text-sm text-gray-600 text-center">
//           People walk to random points, enter through the green door, and exit through the red door
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PeopleSimulation;



// import React, { useEffect, useRef } from "react";

// const PeopleSimulation = ({ peopleCount }) => {
//   const canvasRef = useRef(null);
//   const BOX_WIDTH = 300;
//   const BOX_HEIGHT = 200;

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");

//     const people = Array.from({ length: peopleCount }, () => ({
//       x: Math.random() * (BOX_WIDTH - 30) + 15,
//       y: Math.random() * (BOX_HEIGHT - 30) + 15,
//       vx: (Math.random() - 0.5) * 1.5,
//       vy: (Math.random() - 0.5) * 1.5,
//       color: `hsl(${Math.random() * 360}, 70%, 60%)`,
//     }));

//     const draw = () => {
//       ctx.clearRect(0, 0, BOX_WIDTH, BOX_HEIGHT);
//       ctx.strokeStyle = "#333";
//       ctx.strokeRect(0, 0, BOX_WIDTH, BOX_HEIGHT);

//       people.forEach(p => {
//         p.x += p.vx;
//         p.y += p.vy;
//         if (p.x < 5 || p.x > BOX_WIDTH - 5) p.vx *= -1;
//         if (p.y < 5 || p.y > BOX_HEIGHT - 5) p.vy *= -1;

//         ctx.beginPath();
//         ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
//         ctx.fillStyle = p.color;
//         ctx.fill();
//       });

//       requestAnimationFrame(draw);
//     };

//     draw();
//   }, [peopleCount]);

//   return (
//     <canvas
//       ref={canvasRef}
//       width={BOX_WIDTH}
//       height={BOX_HEIGHT}
//       className="border-2 border-gray-400 rounded-md"
//     />
//   );
// };

// export default PeopleSimulation;


import React, { useEffect, useRef } from "react";

const PeopleSimulation = ({ peopleCount }) => {
  const canvasRef = useRef(null);
  const BOX_WIDTH = 400;
  const BOX_HEIGHT = 250;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Generate people
    const people = Array.from({ length: peopleCount }, () => ({
      x: Math.random() * (BOX_WIDTH - 60) + 30,
      y: Math.random() * (BOX_HEIGHT - 60) + 30,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      legPhase: Math.random() * Math.PI * 2,
    }));

    const drawPerson = (ctx, x, y, color, legPhase, moving) => {
      const headRadius = 4;
      const bodyHeight = 14;
      const bodyWidth = 6;

      // Head
      ctx.beginPath();
      ctx.arc(x, y - bodyHeight / 2 - headRadius, headRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#ffd6a5";
      ctx.fill();
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Body
      ctx.fillStyle = color;
      ctx.fillRect(x - bodyWidth / 2, y - bodyHeight / 2, bodyWidth, bodyHeight);
      ctx.strokeRect(x - bodyWidth / 2, y - bodyHeight / 2, bodyWidth, bodyHeight);

      // Arms
      ctx.beginPath();
      ctx.moveTo(x - bodyWidth / 2, y - bodyHeight / 2 + 3);
      ctx.lineTo(x - bodyWidth / 2 - 4, y - bodyHeight / 2 + 10);
      ctx.moveTo(x + bodyWidth / 2, y - bodyHeight / 2 + 3);
      ctx.lineTo(x + bodyWidth / 2 + 4, y - bodyHeight / 2 + 10);
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Legs (animated)
      if (moving) {
        const swing = Math.sin(legPhase) * 5;
        ctx.beginPath();
        ctx.moveTo(x - 2, y + bodyHeight / 2);
        ctx.lineTo(x - 2 + swing, y + bodyHeight / 2 + 10);
        ctx.moveTo(x + 2, y + bodyHeight / 2);
        ctx.lineTo(x + 2 - swing, y + bodyHeight / 2 + 10);
        ctx.strokeStyle = "#555";
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(x - 2, y + bodyHeight / 2);
        ctx.lineTo(x - 2, y + bodyHeight / 2 + 10);
        ctx.moveTo(x + 2, y + bodyHeight / 2);
        ctx.lineTo(x + 2, y + bodyHeight / 2 + 10);
        ctx.strokeStyle = "#555";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, BOX_WIDTH, BOX_HEIGHT);

      // Box border
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, BOX_WIDTH, BOX_HEIGHT);

      // Entry / Exit doors (visual markers)
      ctx.fillStyle = "#4ade80";
      ctx.fillRect(BOX_WIDTH - 10, 40, 8, 40);
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(BOX_WIDTH - 10, BOX_HEIGHT - 80, 8, 40);

      // Draw each person
      people.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 10 || p.x > BOX_WIDTH - 10) p.vx *= -1;
        if (p.y < 10 || p.y > BOX_HEIGHT - 10) p.vy *= -1;
        p.legPhase += 0.2;

        const isMoving = Math.abs(p.vx) > 0.05 || Math.abs(p.vy) > 0.05;
        drawPerson(ctx, p.x, p.y, p.color, p.legPhase, isMoving);
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, [peopleCount]);

  return (
    <canvas
      ref={canvasRef}
      width={BOX_WIDTH}
      height={BOX_HEIGHT}
      className="border-2 border-gray-300 rounded-lg bg-white shadow-inner"
    />
  );
};

export default PeopleSimulation;
