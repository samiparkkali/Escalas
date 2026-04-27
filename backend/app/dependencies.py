from .repositories import ProfessionalRepository, UnavailabilityRepository
from .services import ScheduleService

# Dependency injection container
class Dependencies:
    def __init__(self):
        self.professional_repository = ProfessionalRepository()
        self.unavailability_repository = UnavailabilityRepository(self.professional_repository)
        self.schedule_service = ScheduleService()

# Global instance
deps = Dependencies()