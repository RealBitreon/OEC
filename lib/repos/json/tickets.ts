import type { ITicketsRepo } from '../interfaces'
import type { Ticket } from '@/lib/store/types'
import { readTickets, writeTickets } from '@/lib/store/readWrite'

export class JsonTicketsRepo implements ITicketsRepo {
  async listByCompetition(competitionId: string): Promise<Ticket[]> {
    const tickets = await readTickets() as Ticket[]
    // If competitionId is empty, return all tickets
    if (!competitionId) {
      return tickets
    }
    return tickets.filter((t: Ticket) => t.competitionId === competitionId)
  }

  async listByStudent(competitionId: string, studentUsername: string): Promise<Ticket[]> {
    const tickets = await readTickets() as Ticket[]
    return tickets.filter((t: Ticket) => 
      t.competitionId === competitionId && t.studentUsername === studentUsername
    )
  }

  async getTotalsByStudent(competitionId: string): Promise<Map<string, number>> {
    const tickets = await this.listByCompetition(competitionId)
    const totals = new Map<string, number>()
    
    for (const ticket of tickets) {
      const current = totals.get(ticket.studentUsername) || 0
      totals.set(ticket.studentUsername, current + ticket.count)
    }
    
    return totals
  }

  async getById(id: string): Promise<Ticket | null> {
    const tickets = await readTickets() as Ticket[]
    return tickets.find((t: Ticket) => t.id === id) || null
  }

  async create(data: Ticket): Promise<Ticket> {
    const tickets = await readTickets() as Ticket[]
    tickets.push(data)
    await writeTickets(tickets)
    return data
  }

  async deleteBySubmission(submissionId: string): Promise<void> {
    const tickets = await readTickets() as Ticket[]
    const filtered = tickets.filter((t: Ticket) => t.submissionId !== submissionId)
    await writeTickets(filtered)
  }

  async deleteByCompetition(competitionId: string): Promise<void> {
    const tickets = await readTickets() as Ticket[]
    const filtered = tickets.filter((t: Ticket) => t.competitionId !== competitionId)
    await writeTickets(filtered)
  }

  async bulkCreate(newTickets: Ticket[]): Promise<void> {
    const tickets = await readTickets() as Ticket[]
    tickets.push(...newTickets)
    await writeTickets(tickets)
  }
}
