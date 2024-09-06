import express from 'express'
import { PrismaClient } from '@prisma/client'
import cors from 'cors'

const prisma = new PrismaClient()

const app = express()
app.use(express.json())
app.use(cors())

app.post('/alunos', async (req, res)=>{
    try {
        const { name, age, monthlyFee, paymentDate,pendingMonths, guardian } = req.body

        if(!name || !age || !monthlyFee || !pendingMonths || !paymentDate || !guardian || !guardian.email || !guardian.name || !guardian.number){
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }

        const novoAluno = await prisma.students.create({
            data: {
                name,
                age,
                monthlyFee,
                paymentDate: req.body.paymentDate,
                pendingMonths,
                guardian: {
                    create: {
                        email: guardian.email,
                        name: guardian.name,
                        number: guardian.number
                    }
                }
            }
        })

        res.status(201).json(novoAluno);
    } catch(error) {
        console.error('Erro ao criar aluno:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    } 
})

app.get('/alunos', async (req, res)=>{

    let students = []

    if(req.query){
        students = await prisma.students.findMany({
            where: {
                name: req.query.name,
                age: req.query.age,
                monthlyFee: req.query.monthlyFee,
                paymentDate: req.query.paymentDate,
                guardianId: req.query.guardianId,
                classroom: req.query.classroom,
                paymentStatus: req.query.paymentStatus,
                monthsInArrears: req.query.monthsInArrears,

            }, include: {
                guardian: true
            }
        })
    }else{
        students = await prisma.students.findMany()
    }
    res.status(200).json(students)
})

app.patch('/alunos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, age, monthlyFee, paymentDate, classroom, paymentStatus, monthsInArrears, guardian } = req.body;

        const updatedStudent = await prisma.students.update({
            where: {
                id
            },
            data: {
                name,
                age,
                monthlyFee,
                paymentDate,
                classroom,
                paymentStatus,
                monthsInArrears,
                guardian: guardian ? {
                    update: {
                        email: guardian.email,
                        name: guardian.name,
                        number: guardian.number
                    }
                } : undefined
            }
        });

        res.status(200).json(updatedStudent);
    } catch (error) {
        console.error('Erro ao atualizar aluno:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.delete('/alunos/:id', async (req, res)=>{

    const {id} = req.params

try {
    await prisma.students.delete({
        where: {
            id
        }
    });

    res.status(200).json({message: "Usuário deletado com sucesso"});
    }catch(error) { 
    console.error('Erro ao deletar aluno:', error);
        res.status(500).json({ error: 'Erro ao deletar aluno' });
    }

})


app.listen(3000)