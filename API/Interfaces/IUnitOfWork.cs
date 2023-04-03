using System.ComponentModel.Design;

namespace API.Interfaces
{
    public interface IUnitOfWork
    {
        IUserRepository UserRepository {get;}
        IMessageResponsitory MessageResponsitory {get;}
        ILikesRespository LikesRespository {get;}
        Task<bool> Complete();
        bool HasChanges();
    }
}