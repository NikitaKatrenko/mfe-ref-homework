import { useEffect, useState } from "react";
import { z } from "zod";
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from "@/firebaseConfig";
import { taskSchema } from "@/data/schema";
import { Task } from "@/data/schema";
import {DataTableRowAdd} from "@/components/DataTableRowAdd";


export default function TaskForm() {
    const [_, setTasks] = useState<Task[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(db, 'tasks'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            setError(null);
            try {
                const tasksArray = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                const todos = tasksArray.map((item: any) => ({
                    id: item.id,
                    todo: item.todo,
                    status: item.completed ? "done" : "todo",
                    priority: item.priority || "medium",
                    name: item.name,
                }));

                const parsedTasks = z.array(taskSchema).parse(todos);
                setTasks(parsedTasks);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'An unknown error occurred');
                console.error("Error fetching tasks:", e);
            }
        }, (error) => {
            console.error("Firestore error:", error);
            setError("Failed to fetch tasks. Please try again later.");
        });

        return () => unsubscribe();
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <DataTableRowAdd />
    );
}